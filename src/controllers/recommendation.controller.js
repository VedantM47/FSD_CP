import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import { getTopRecommendation } from '../services/recommendationEngine.js';

/**
 * Get AI recommendation for a team in a hackathon
 * @route GET /api/recommendations/:hackathonId
 */
export const getRecommendation = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user._id;

    // Fetch hackathon with problem statements
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    // Check if hackathon has problem statements
    if (!hackathon.problemStatements || hackathon.problemStatements.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No problem statements available for this hackathon'
      });
    }

    // Find user's team in this hackathon
    const team = await Team.findOne({
      hackathonId,
      'members.userId': userId
    }).populate('members.userId', 'name email skills interests bio');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'You are not part of any team in this hackathon'
      });
    }

    // Check if team has accepted members with skills
    const acceptedMembers = team.members.filter(m => m.status === 'accepted');
    if (acceptedMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your team has no accepted members yet'
      });
    }

    // Check if team has any skills
    const hasSkills = acceptedMembers.some(member => {
      const user = member.userId;
      return (user.skills && user.skills.length > 0) || 
             (user.interests && user.interests.length > 0) ||
             (user.bio && user.bio.trim().length > 0);
    });

    if (!hasSkills && (!team.projectDescription || team.projectDescription.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Your team needs to add skills, interests, or a project description for AI recommendations'
      });
    }

    // Generate recommendation
    const recommendation = getTopRecommendation(team, hackathon.problemStatements);

    if (!recommendation) {
      return res.status(400).json({
        success: false,
        message: 'Unable to generate recommendation. Please ensure your team has skills or interests added.'
      });
    }

    // Return recommendation
    return res.status(200).json({
      success: true,
      data: {
        teamName: team.name,
        recommendation: {
          problemStatement: recommendation.problemStatement,
          matchScore: recommendation.matchScore,
          rankPosition: recommendation.rankPosition,
          skillOverlap: recommendation.skillOverlap,
          domainOverlap: recommendation.domainOverlap
        }
      }
    });

  } catch (error) {
    console.error('Error generating recommendation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate recommendation',
      error: error.message
    });
  }
};
