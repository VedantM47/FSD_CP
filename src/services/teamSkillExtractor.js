import { extractAll } from '../utils/skillExtractor.js';

/**
 * Extract skills from team members
 * @param {Object} team - Team object with members
 * @returns {Object} - Extracted team skill profile
 */
export const extractTeamSkills = (team) => {
  if (!team || !team.members || team.members.length === 0) {
    return {
      skills: [],
      domains: [],
      tools: []
    };
  }

  const allSkills = new Set();
  const allDomains = new Set();
  const allTools = new Set();

  // Extract from team members
  team.members.forEach(member => {
    const user = member.userId;
    if (!user) return;

    // Extract from user skills
    if (user.skills && Array.isArray(user.skills)) {
      user.skills.forEach(skill => {
        const extracted = extractAll(skill);
        extracted.skills.forEach(s => allSkills.add(s));
        extracted.domains.forEach(d => allDomains.add(d));
        extracted.tools.forEach(t => allTools.add(t));
      });
    }

    // Extract from user interests
    if (user.interests && Array.isArray(user.interests)) {
      user.interests.forEach(interest => {
        const extracted = extractAll(interest);
        extracted.skills.forEach(s => allSkills.add(s));
        extracted.domains.forEach(d => allDomains.add(d));
        extracted.tools.forEach(t => allTools.add(t));
      });
    }

    // Extract from user bio
    if (user.bio) {
      const extracted = extractAll(user.bio);
      extracted.skills.forEach(s => allSkills.add(s));
      extracted.domains.forEach(d => allDomains.add(d));
      extracted.tools.forEach(t => allTools.add(t));
    }
  });

  // Extract from team project description
  if (team.projectDescription) {
    const extracted = extractAll(team.projectDescription);
    extracted.skills.forEach(s => allSkills.add(s));
    extracted.domains.forEach(d => allDomains.add(d));
    extracted.tools.forEach(t => allTools.add(t));
  }

  return {
    skills: Array.from(allSkills),
    domains: Array.from(allDomains),
    tools: Array.from(allTools)
  };
};

/**
 * Create a text representation of team skills for embedding
 * @param {Object} teamSkillProfile - Team skill profile
 * @returns {string} - Text representation
 */
export const teamSkillsToText = (teamSkillProfile) => {
  const parts = [];

  if (teamSkillProfile.skills && teamSkillProfile.skills.length > 0) {
    parts.push(`Skills: ${teamSkillProfile.skills.join(', ')}`);
  }

  if (teamSkillProfile.domains && teamSkillProfile.domains.length > 0) {
    parts.push(`Domains: ${teamSkillProfile.domains.join(', ')}`);
  }

  if (teamSkillProfile.tools && teamSkillProfile.tools.length > 0) {
    parts.push(`Tools: ${teamSkillProfile.tools.join(', ')}`);
  }

  return parts.join('. ');
};
