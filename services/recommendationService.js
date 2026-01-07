import TeamSkillProfile from '../models/TeamSkillProfile.js';
import ProblemStatement from '../models/ProblemStatement.js';
import ProblemMetadata from '../models/ProblemMetadata.js';
import ProblemEmbedding from '../models/ProblemEmbedding.js';
import RecommendationResult from '../models/RecommendationResult.js';
import embeddingService from './embeddingService.js';
import { extractAll } from '../utils/skillExtractor.js';

/**
 * Rule-based filtering to shortlist candidate problems
 * This avoids brute-force vector matching for scalability
 * @param {string} teamId - Team ID
 * @param {number} limit - Maximum number of candidates to return
 * @returns {Promise<Array>} - Array of candidate problem IDs with metadata
 */
const getCandidateProblems = async (teamId, limit = 50) => {
  try {
    // Get team skill profile
    const teamProfile = await TeamSkillProfile.findOne({ teamId });
    if (!teamProfile) {
      throw new Error('Team skill profile not found. Please extract team skills first.');
    }

    const teamSkills = teamProfile.extractedSkills || [];
    const teamDomains = teamProfile.domains || [];

    // If team has no extracted skills/domains, fetch recent metadata so we still return something
    let metadataQuery = {};

    if (teamDomains.length > 0 || teamSkills.length > 0) {
      // Rule 1: Filter by domain overlap
      let domainQuery = {};
      if (teamDomains.length > 0) {
        domainQuery = { domains: { $in: teamDomains } };
      }

      // Rule 2: Filter by skill overlap (at least one matching skill)
      let skillQuery = {};
      if (teamSkills.length > 0) {
        skillQuery = { requiredSkills: { $in: teamSkills } };
      }

      // Combine queries (OR logic - match domain OR skill)
      metadataQuery = {
        $or: [
          domainQuery,
          skillQuery,
        ],
      };
    } else {
      // No team signals => allow all metadata (limited) to avoid empty result
      metadataQuery = {};
    }

    // Get problem metadata matching the criteria
    let matchingMetadata = await ProblemMetadata.find(metadataQuery)
      .limit(limit * 2) // Get more candidates for better ranking
      .sort({ createdAt: -1 })
      .lean();

    // Fallback: if nothing matched (e.g., descriptions too vague), use all metadata
    if (!matchingMetadata || matchingMetadata.length === 0) {
      matchingMetadata = await ProblemMetadata.find({})
        .limit(limit * 2)
        .sort({ createdAt: -1 })
        .lean();
    }

    // Rule 3: Score candidates based on overlap
    const scoredCandidates = matchingMetadata.map(metadata => {
      const problemSkills = metadata.requiredSkills || [];
      const problemDomains = metadata.domains || [];

      // Calculate skill overlap score
      const skillOverlap = teamSkills.filter(skill => 
        problemSkills.some(ps => ps.toLowerCase() === skill.toLowerCase())
      ).length;
      const skillScore = skillOverlap / Math.max(problemSkills.length, 1);

      // Calculate domain overlap score
      const domainOverlap = teamDomains.filter(domain => 
        problemDomains.some(pd => pd.toLowerCase() === domain.toLowerCase())
      ).length;
      const domainScore = domainOverlap / Math.max(problemDomains.length, 1);

      // Combined rule-based score
      const ruleScore = (skillScore * 0.6) + (domainScore * 0.4);

      return {
        problemId: metadata.problemId,
        metadata,
        ruleScore,
      };
    });

    // Sort by rule score and return top candidates
    return scoredCandidates
      .sort((a, b) => b.ruleScore - a.ruleScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error in getCandidateProblems:', error);
    throw error;
  }
};

/**
 * AI-based ranking using semantic similarity
 * @param {string} teamId - Team ID
 * @param {Array} candidates - Candidate problems from rule-based filtering
 * @returns {Promise<Array>} - Ranked problems with match scores
 */
const rankWithAI = async (teamId, candidates) => {
  try {
    // Get team skill profile for embedding generation
    const teamProfile = await TeamSkillProfile.findOne({ teamId });
    if (!teamProfile) {
      throw new Error('Team skill profile not found');
    }

    // Create team embedding from aggregated skills and domains
    const teamText = [
      ...(teamProfile.extractedSkills || []),
      ...(teamProfile.domains || []),
      ...(teamProfile.tools || []),
    ].join(' ');

    const teamEmbedding = embeddingService.generateEmbedding(teamText);

    // Get embeddings for all candidate problems
    const problemIds = candidates.map(c => c.problemId);
    const embeddings = await ProblemEmbedding.find({
      problemId: { $in: problemIds },
    }).lean();

    const embeddingMap = new Map(
      embeddings.map(e => [e.problemId.toString(), e.embedding])
    );

    // Fetch problem statements once for fallback embedding generation
    const problems = await ProblemStatement.find({ _id: { $in: problemIds } }).lean();
    const problemDescMap = new Map(problems.map(p => [p._id.toString(), p.description || '']));

    // Calculate semantic similarity for each candidate
    const ranked = candidates.map(candidate => {
      const problemEmbedding = embeddingMap.get(candidate.problemId.toString());
      let finalEmbedding = problemEmbedding;

      // If embedding is missing, generate on the fly from the problem description
      if (!finalEmbedding) {
        const desc = problemDescMap.get(candidate.problemId.toString()) || '';
        finalEmbedding = embeddingService.generateEmbedding(desc);
        // Persist for future calls (best effort)
        ProblemEmbedding.findOneAndUpdate(
          { problemId: candidate.problemId },
          { problemId: candidate.problemId, embedding: finalEmbedding, embeddingModel: 'tfidf' },
          { upsert: true }
        ).catch(err => console.error('Error upserting embedding:', err));
      }

      // Calculate cosine similarity (safe: cosineSimilarity returns 0 if vectors are zero)
      const semanticScore = finalEmbedding
        ? embeddingService.cosineSimilarity(teamEmbedding, finalEmbedding)
        : 0;

      // Combine rule-based and semantic scores
      // Weight: 40% rule-based, 60% semantic
      const matchScore = (candidate.ruleScore * 0.4) + (semanticScore * 0.6);

      return {
        problemId: candidate.problemId,
        matchScore,
        ruleScore: candidate.ruleScore,
        semanticScore,
      };
    });

    // Sort by match score (descending)
    return ranked.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error in rankWithAI:', error);
    throw error;
  }
};

/**
 * Main recommendation function
 * Generates recommendations for a team
 * @param {string} teamId - Team ID
 * @param {number} topN - Number of top recommendations to return
 * @returns {Promise<Array>} - Array of recommended problems with details
 */
export const generateRecommendations = async (teamId, topN = 10) => {
  try {
    // Step 1: Rule-based candidate retrieval
    const candidates = await getCandidateProblems(teamId, 50);

    if (candidates.length === 0) {
      // Hard fallback: use all problems if something went wrong upstream
      const fallbackMetadata = await ProblemMetadata.find({})
        .limit(topN * 5)
        .lean();
      const fallbackCandidates = fallbackMetadata.map(m => ({
        problemId: m.problemId,
        metadata: m,
        ruleScore: 0,
      }));
      if (fallbackCandidates.length === 0) return [];
      const rankedFallback = await rankWithAI(teamId, fallbackCandidates);
      const topFallback = rankedFallback.slice(0, topN);
      await saveRecommendations(teamId, topFallback);
      return await buildRecommendationPayload(topFallback);
    }

    // Step 2: AI-based ranking
    const ranked = await rankWithAI(teamId, candidates);

    // Step 3: Get top N recommendations
    const topRecommendations = ranked.slice(0, topN);

    // Step 4: Fetch full problem details
    const recommendations = await buildRecommendationPayload(topRecommendations);

    // Step 7: Save recommendations to database
    await saveRecommendations(teamId, recommendations);

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

// Helper to build response payload
const buildRecommendationPayload = async (recs) => {
  const problemIds = recs.map(r => r.problemId);
  const problems = await ProblemStatement.find({
    _id: { $in: problemIds },
  }).lean();

  const problemMap = new Map(
    problems.map(p => [p._id.toString(), p])
  );

  const metadataList = await ProblemMetadata.find({
    problemId: { $in: problemIds },
  }).lean();

  const metadataMap = new Map(
    metadataList.map(m => [m.problemId.toString(), m])
  );

  return recs.map((rec, index) => {
    const problem = problemMap.get(rec.problemId.toString());
    const metadata = metadataMap.get(rec.problemId.toString());

    return {
      problemId: rec.problemId,
      rank: rec.rank || index + 1,
      matchScore: rec.matchScore,
      ruleScore: rec.ruleScore,
      semanticScore: rec.semanticScore,
      problem: {
        title: problem?.title || 'Untitled',
        description: problem?.description || '',
        source: problem?.source || 'platform',
        createdAt: problem?.createdAt,
      },
      metadata: metadata ? {
        domains: metadata.domains,
        requiredSkills: metadata.requiredSkills,
        difficulty: metadata.difficulty,
        keywords: metadata.keywords,
      } : null,
    };
  });
};

/**
 * Save recommendations to database
 * @param {string} teamId - Team ID
 * @param {Array} recommendations - Recommendations array
 */
const saveRecommendations = async (teamId, recommendations) => {
  try {
    // Delete old recommendations for this team
    await RecommendationResult.deleteMany({ teamId });

    // Insert new recommendations
    const results = recommendations.map(rec => ({
      teamId,
      problemId: rec.problemId,
      matchScore: rec.matchScore,
      rankPosition: rec.rank,
    }));

    await RecommendationResult.insertMany(results);
  } catch (error) {
    console.error('Error saving recommendations:', error);
    // Don't throw - recommendations are still valid even if save fails
  }
};

/**
 * Get stored recommendations for a team
 * @param {string} teamId - Team ID
 * @param {number} limit - Number of recommendations to return
 * @returns {Promise<Array>} - Stored recommendations
 */
export const getStoredRecommendations = async (teamId, limit = 10) => {
  try {
    const results = await RecommendationResult.find({ teamId })
      .sort({ rankPosition: 1 })
      .limit(limit)
      .populate('problemId')
      .lean();

    // Fetch metadata for each problem
    const problemIds = results.map(r => r.problemId._id);
    const metadataList = await ProblemMetadata.find({
      problemId: { $in: problemIds },
    }).lean();

    const metadataMap = new Map(
      metadataList.map(m => [m.problemId.toString(), m])
    );

    return results.map(result => ({
      problemId: result.problemId._id,
      rank: result.rankPosition,
      matchScore: result.matchScore,
      problem: {
        title: result.problemId.title,
        description: result.problemId.description,
        source: result.problemId.source,
        createdAt: result.problemId.createdAt,
      },
      metadata: metadataMap.get(result.problemId._id.toString()) || null,
    }));
  } catch (error) {
    console.error('Error getting stored recommendations:', error);
    throw error;
  }
};

