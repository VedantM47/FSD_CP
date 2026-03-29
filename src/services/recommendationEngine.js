import { generateEmbeddings, cosineSimilarity } from './embeddingService.js';
import { extractTeamSkills, teamSkillsToText } from './teamSkillExtractor.js';
import { extractAll } from '../utils/skillExtractor.js';

/**
 * Generate recommendations for a team based on problem statements
 * @param {Object} team - Team object
 * @param {Array} problemStatements - Array of problem statements
 * @returns {Array} - Ranked recommendations with scores
 */
export const generateRecommendations = (team, problemStatements) => {
  if (!team || !problemStatements || problemStatements.length === 0) {
    return [];
  }

  // Extract team skills
  const teamSkillProfile = extractTeamSkills(team);
  const teamText = teamSkillsToText(teamSkillProfile);

  // If team has no skills, return empty recommendations
  if (!teamText || teamText.trim().length === 0) {
    return [];
  }

  // Create problem statement texts
  const problemTexts = problemStatements.map(ps => {
    const extracted = extractAll(`${ps.title} ${ps.description}`);
    return `${ps.title}. ${ps.description}. Skills: ${extracted.skills.join(', ')}. Domains: ${extracted.domains.join(', ')}`;
  });

  // Generate embeddings
  const allTexts = [teamText, ...problemTexts];
  const embeddings = generateEmbeddings(allTexts);

  if (embeddings.length === 0) {
    return [];
  }

  const teamEmbedding = embeddings[0];
  const problemEmbeddings = embeddings.slice(1);

  // Calculate similarity scores
  const recommendations = problemStatements.map((ps, index) => {
    const similarity = cosineSimilarity(teamEmbedding, problemEmbeddings[index]);
    
    // Boost score based on skill overlap
    const psExtracted = extractAll(`${ps.title} ${ps.description}`);
    const skillOverlap = teamSkillProfile.skills.filter(skill => 
      psExtracted.skills.includes(skill)
    ).length;
    const domainOverlap = teamSkillProfile.domains.filter(domain => 
      psExtracted.domains.includes(domain)
    ).length;

    // Calculate final score (weighted combination)
    const finalScore = (similarity * 0.6) + (skillOverlap * 0.02) + (domainOverlap * 0.05);

    return {
      problemStatement: ps,
      matchScore: Math.min(finalScore, 1), // Cap at 1
      skillOverlap,
      domainOverlap
    };
  });

  // Sort by match score (descending)
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  // Add rank position
  recommendations.forEach((rec, index) => {
    rec.rankPosition = index + 1;
  });

  return recommendations;
};

/**
 * Get top recommendation for a team
 * @param {Object} team - Team object
 * @param {Array} problemStatements - Array of problem statements
 * @returns {Object|null} - Top recommendation or null
 */
export const getTopRecommendation = (team, problemStatements) => {
  const recommendations = generateRecommendations(team, problemStatements);
  return recommendations.length > 0 ? recommendations[0] : null;
};
