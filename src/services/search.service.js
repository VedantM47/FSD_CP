import User from '../models/user.model.js';
import log from '../utils/logger.js';

/*
  Functionality: Search hackathon participants by name + skills tags.
  Input:
    - hackathonId (required)
    - name (optional, partial match)
    - tags (optional array of skill text)
  Behavior:
    - Include all participants (hackathonRoles for hackathonId)
    - Return users sorted primarily by number of matching tags and secondarily by name.
*/
export const searchParticipantsByHackathon = async ({ hackathonId, name = '', tags = [], excludeUserId = null }) => {
  try {
    if (!hackathonId) {
      throw new Error('hackathonId is required for participant search.');
    }

    const query = {
      systemRole: 'user',
      'hackathonRoles.hackathonId': hackathonId,
    };

    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    if (name) {
      query.$or = [
        { fullName: { $regex: name, $options: 'i' } },
        { email: { $regex: name, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('fullName email skills bio college major year degree hackathonRoles')
      .lean();

    const normalizedTags = tags.map(t => t.trim().toLowerCase()).filter(Boolean);

    const results = users.map(user => {
      const userSkillsLower = (user.skills || []).map(s => (typeof s === 'string' ? s.toLowerCase() : ''));

      const matchingSkills = normalizedTags.length > 0
        ? normalizedTags.filter(tag => userSkillsLower.some(us => us.includes(tag) || tag.includes(us)))
        : [];

      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        skills: user.skills || [],
        bio: user.bio,
        college: user.college,
        major: user.major,
        year: user.year,
        degree: user.degree,
        hackathonRoles: user.hackathonRoles,
        matchingSkills,
        matchCount: matchingSkills.length,
      };
    })
    .filter(u => {
      if (normalizedTags.length > 0) {
        return u.matchCount > 0;
      }
      return true;
    });

    const sorted = results.sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return a.fullName.localeCompare(b.fullName);
    });

    return sorted.slice(0, 100);
  } catch (error) {
    log.error('SEARCH_SERVICE', 'Error searching hackathon participants', error);
    throw error;
  }
};