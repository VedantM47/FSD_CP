import User from '../models/user.model.js';
import log from '../utils/logger.js';

/*
  Functionality: Search teammates by skills tags
  Simple tag-based matching - no AI needed.
  
  Input: Array of skill tags (e.g. ['javascript', 'react'])
  Returns: Users sorted by number of matching skills
*/
export const searchTeamsByTags = async (searchTags) => {
  try {
    // Fetch all users with their skills
    const allUsers = await User.find({ skills: { $exists: true, $ne: [] } })
      .select('fullName email skills bio department interests')
      .lean();

    // Calculate match score for each user
    const results = allUsers.map(user => {
      const userSkillsLower = user.skills.map(s => s.toLowerCase());
      
      // Count how many search tags match user's skills
      const matchingSkills = searchTags.filter(tag => 
        userSkillsLower.some(userSkill => userSkill.includes(tag) || tag.includes(userSkill))
      );

      // Only include users who have at least one matching skill
      if (matchingSkills.length === 0) {
        return null;
      }

      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        skills: user.skills,
        bio: user.bio,
        department: user.department,
        interests: user.interests,
        matchingSkills: matchingSkills,
        matchCount: matchingSkills.length
      };
    })
    .filter(result => result !== null);

    // Sort by match count (highest first)
    results.sort((a, b) => b.matchCount - a.matchCount);

    // Return top 20 results
    return results.slice(0, 20);
  } catch (error) {
    log.error('SEARCH_SERVICE', 'Error searching teammates by tags', error);
    throw error;
  }
};

/*
  Functionality: Generate User Embedding (simplified)
  This function is now a no-op since we're using simple tag matching.
  Users' skills are already stored in their profiles.
  
  Input: userId
  Returns: Success message
*/
export const generateUserEmbedding = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    log.info('EMBED', `User ${user.fullName} profile is ready for teammate search`);
    return { message: 'User profile ready', skillCount: user.skills?.length || 0 };
  } catch (error) {
    log.error('EMBED', 'Error generating user embedding', error);
    throw error;
  }
};