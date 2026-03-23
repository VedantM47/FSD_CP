import { searchTeamsByTags } from '../services/search.service.js';
import log from '../utils/logger.js';

/*
  Functionality: Search for teammates by skills/tags
  Now uses simple tag-based matching instead of AI embeddings.
  
  Input: Query param 'tags' (comma-separated skills, e.g. ?tags=javascript,react,nodejs)
  Returns: List of matching users with matching skill count
*/
export const searchTeam = async (req, res, next) => {
  try {
    const { tags } = req.query;
    
    if (!tags) {
      return next({ statusCode: 400, message: "Search query 'tags' is required (comma-separated skills)" });
    }

    // Parse comma-separated tags
    const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
    
    if (tagArray.length === 0) {
      return next({ statusCode: 400, message: "Please provide at least one valid tag" });
    }

    log.info('SEARCH', `Searching teammates with tags: ${tagArray.join(', ')}`);
    const matches = await searchTeamsByTags(tagArray);

    res.status(200).json({
      success: true,
      count: matches.length,
      searchedTags: tagArray,
      data: matches
    });
  } catch (error) {
    log.error('SEARCH', `Error searching teammates`, error);
    next(error);
  }
};

/*
  Functionality: Embed User (simplified)
  Previously used AI embeddings. Now just returns a success message
  as users already have skills stored in their profile.
  
  Input: req.user._id (from auth token)
  Returns: JSON success message
*/
export const embedUser = async (req, res, next) => {
  try {
    log.success('EMBED', `User ${req.user._id} profile ready for teammate search`);
    
    res.status(200).json({
      success: true,
      message: "User profile is ready for teammate search. Skills can be updated in profile settings."
    });
  } catch (error) {
    next(error);
  }
};