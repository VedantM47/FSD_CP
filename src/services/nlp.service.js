import natural from 'natural';
import Team from '../models/team.model.js';
import TeamSkillProfile from '../models/teamSkillProfile.model.js';
import { extractSkills, extractDomains, extractTools, extractAll } from '../utils/skillExtractor.js';

/**
 * Extract and aggregate skills from all team members
 * @param {string} teamId - Team ID
 * @returns {Promise<Object>} - Extracted skills, domains, and tools
 */
export const extractTeamSkills = async (teamId) => {
  try {
    const team = await Team.findById(teamId).populate('leader').populate('members.userId');
    
    if (!team) {
      throw new Error('Team not found');
    }

    // Collect all text data from team members
    let aggregatedText = '';

    // Add leader's information
    if (team.leader) {
      const leader = team.leader;
      aggregatedText += ` ${leader.skills?.join(' ') || ''}`;
      aggregatedText += ` ${leader.department || ''}`;
      aggregatedText += ` ${leader.college || ''}`;
      if (leader.github) aggregatedText += ` ${leader.github}`;
      if (leader.linkedin) aggregatedText += ` ${leader.linkedin}`;
    }

    // Add members' information
    if (team.members && team.members.length > 0) {
      for (const member of team.members) {
        if (member.userId && member.status === 'accepted') {
          const user = member.userId;
          aggregatedText += ` ${user.skills?.join(' ') || ''}`;
          aggregatedText += ` ${user.department || ''}`;
          aggregatedText += ` ${user.college || ''}`;
          if (user.github) aggregatedText += ` ${user.github}`;
          if (user.linkedin) aggregatedText += ` ${user.linkedin}`;
        }
      }
    }

    // Add project information if available
    if (team.project) {
      aggregatedText += ` ${team.project.title || ''}`;
      aggregatedText += ` ${team.project.description || ''}`;
    }

    // Extract skills, domains, and tools
    const extracted = extractAll(aggregatedText);

    // Update or create team skill profile
    const skillProfile = await TeamSkillProfile.findOneAndUpdate(
      { teamId: teamId },
      {
        teamId: teamId,
        extractedSkills: extracted.skills,
        domains: extracted.domains,
        tools: extracted.tools,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return {
      teamId: teamId,
      extractedSkills: extracted.skills,
      domains: extracted.domains,
      tools: extracted.tools,
      profile: skillProfile,
    };
  } catch (error) {
    console.error('Error extracting team skills:', error);
    throw error;
  }
};

/**
 * Process problem statement and extract metadata
 * @param {string} problemId - Problem statement ID
 * @param {string} description - Problem description
 * @returns {Promise<Object>} - Extracted metadata
 */
export const extractProblemMetadata = async (problemId, description) => {
  try {
    const extracted = extractAll(description);

    // Determine difficulty based on keywords
    let difficulty = 'medium';
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('beginner') || lowerDesc.includes('easy') || lowerDesc.includes('simple')) {
      difficulty = 'easy';
    } else if (lowerDesc.includes('advanced') || lowerDesc.includes('complex') || lowerDesc.includes('expert')) {
      difficulty = 'hard';
    }

    // Extract keywords (important terms)
    const keywords = extractKeywords(description);

    return {
      problemId,
      domains: extracted.domains,
      requiredSkills: extracted.skills,
      difficulty,
      keywords,
      tools: extracted.tools,
    };
  } catch (error) {
    console.error('Error extracting problem metadata:', error);
    throw error;
  }
};

/**
 * Extract keywords from text
 * @param {string} text - Input text
 * @returns {Array<string>} - Array of keywords
 */
const extractKeywords = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Filter out common stop words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can']);
  
  const keywords = tokens
    .filter(token => token.length > 3 && !stopWords.has(token))
    .slice(0, 20); // Limit to top 20 keywords

  return [...new Set(keywords)]; // Remove duplicates
};

