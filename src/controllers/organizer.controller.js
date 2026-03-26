
import Hackathon from '../models/hackathon.model.js';
import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import Submission from '../models/submission.model.js';
import log from '../utils/logger.js';
import mongoose from 'mongoose';


export const getOrganizerHackathons = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Convert to ObjectId to be safe for the direct MongoDB query
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let hackathons = await Hackathon.find({
      $or: [
        { createdBy: userObjectId },
        { "organizers.organizerUserId": userObjectId }
      ]
    }).sort({ createdAt: -1 });

    // Fallback: If MongoDB query failed due to casting/indexing, filter manually
    if (hackathons.length === 0) {
      const allHackathons = await Hackathon.find({}).lean();
      hackathons = allHackathons.filter(h => 
        String(h.createdBy) === String(userId) || 
        h.organizers?.some(org => String(org.userId) === String(userId))
      );
    }

    // Enrich results
    const enriched = await Promise.all(
      hackathons.map(async (h) => {
        const hId = h._id || h.id;
        const [teamCount, submissionCount] = await Promise.all([
          Team.countDocuments({ hackathonId: hId }),
          Submission.countDocuments({ hackathonId: hId }),
        ]);
        
        // Ensure keys match your Frontend Card needs
        return { 
          ...(h.toObject ? h.toObject() : h), 
          teamCount, 
          submissionCount,
          teamsCount: teamCount, 
          submissionsCount: submissionCount 
        };
      })
    );

    log.success('ORGANIZER_HACKATHONS', `Returning ${enriched.length} hackathons for ${req.user.email}`);
    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    log.error('ORGANIZER_HACKATHONS', 'Failed', err);
    next({ statusCode: 500, message: err.message });
  }
};