import { extractTeamSkills } from '../services/nlp.service.js';
import { generateRecommendations, getStoredRecommendations } from '../services/recommendation.service.js';
import TeamSkillProfile from '../models/teamSkillProfile.model.js';
import Team from '../models/team.model.js';

/**
 * Extract and update team skill profile
 * POST /api/recommendations/teams/:teamId/extract-skills
 */
export const extractTeamSkillsController = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Extract team skills
    const result = await extractTeamSkills(teamId);

    res.json({
      success: true,
      message: 'Team skills extracted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error extracting team skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error extracting team skills',
      error: error.message,
    });
  }
};

/**
 * Get team skill profile
 * GET /api/recommendations/teams/:teamId/skills
 */
export const getTeamSkills = async (req, res) => {
  try {
    const { teamId } = req.params;

    const profile = await TeamSkillProfile.findOne({ teamId }).lean();
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Team skill profile not found. Please extract skills first.',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error getting team skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team skills',
      error: error.message,
    });
  }
};

/**
 * Generate recommendations for a team
 * POST /api/recommendations/teams/:teamId/generate
 */
export const generateRecommendationsController = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { topN = 10, forceRegenerate = false } = req.body;

    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if team skill profile exists
    let profile = await TeamSkillProfile.findOne({ teamId });
    if (!profile) {
      // Auto-extract skills if profile doesn't exist
      await extractTeamSkills(teamId);
      profile = await TeamSkillProfile.findOne({ teamId });
    }

    // Generate recommendations
    const recommendations = await generateRecommendations(teamId, parseInt(topN));

    if (recommendations.length === 0) {
      return res.json({
        success: true,
        message: 'No recommendations found. Try adding more problem statements or updating team skills.',
        data: [],
      });
    }

    res.json({
      success: true,
      message: 'Recommendations generated successfully',
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message,
    });
  }
};

/**
 * Get stored recommendations for a team
 * GET /api/recommendations/teams/:teamId
 */
export const getRecommendations = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { limit = 10 } = req.query;

    const recommendations = await getStoredRecommendations(teamId, parseInt(limit));

    if (recommendations.length === 0) {
      return res.json({
        success: true,
        message: 'No stored recommendations found. Generate recommendations first.',
        data: [],
      });
    }

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message,
    });
  }
};

/**
 * Get recommendation statistics for a team
 * GET /api/recommendations/teams/:teamId/stats
 */
export const getRecommendationStats = async (req, res) => {
  try {
    const { teamId } = req.params;

    const profile = await TeamSkillProfile.findOne({ teamId }).lean();
    const recommendations = await getStoredRecommendations(teamId, 100);

    // Calculate statistics
    const stats = {
      hasProfile: !!profile,
      profileLastUpdated: profile?.lastUpdated || null,
      totalRecommendations: recommendations.length,
      averageMatchScore: recommendations.length > 0
        ? recommendations.reduce((sum, r) => sum + (r.matchScore || 0), 0) / recommendations.length
        : 0,
      topMatchScore: recommendations.length > 0
        ? Math.max(...recommendations.map(r => r.matchScore || 0))
        : 0,
      skillCount: profile?.extractedSkills?.length || 0,
      domainCount: profile?.domains?.length || 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting recommendation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendation statistics',
      error: error.message,
    });
  }
};

