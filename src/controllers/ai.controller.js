import { generateUserEmbedding, searchSimilarUsers } from '../services/ai.service.js';

/*
  Functionality: Embed User
  Triggers the AI to read the current user's profile, convert it into a vector, and save it.
  
  Input: req.user._id (from auth token)
  Returns: JSON success message
*/
export const embedUser = async (req, res, next) => {
  try {
    await generateUserEmbedding(req.user._id);

    res.status(200).json({
      success: true,
      message: "User embedding generated and saved successfully."
    });
  } catch (error) {
    next(error);
  }
};

/*
  Functionality: Search Team
  Finds users with similar skills/bios using vector similarity.
  
  Input: Query param 'q' (e.g. ?q=looking for python expert)
  Returns: List of matching users with scores
*/
export const searchTeam = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return next({ statusCode: 400, message: "Search query 'q' is required" });
    }

    const matches = await searchSimilarUsers(q);

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};