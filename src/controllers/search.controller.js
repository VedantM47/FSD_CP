import { searchParticipantsByHackathon } from '../services/search.service.js';
import log from '../utils/logger.js';

/*
  Functionality: Search for hackathon participants by name + tags
  Input: query params
    - hackathonId (required)
    - name (optional)
    - tags (comma-separated optional)
*/
export const searchTeam = async (req, res, next) => {
  try {
    const { hackathonId, name, tags = '' } = req.query;

    if (!hackathonId) {
      return next({ statusCode: 400, message: "Query parameter 'hackathonId' is required" });
    }

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag);

    log.info('SEARCH', `Searching teammates in hackathon ${hackathonId} by name='${name || ''}', tags=[${tagArray.join(', ')}]`);

    const matches = await searchParticipantsByHackathon({
      hackathonId,
      name: name || '',
      tags: tagArray,
      excludeUserId: req.user?._id,
    });

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    log.error('SEARCH', `Error searching teammates`, error);
    next(error);
  }
};