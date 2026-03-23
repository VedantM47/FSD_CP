import OrganizerApplication from '../models/organizerApplication.model.js';
import Hackathon from '../models/hackathon.model.js';
import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import Submission from '../models/submission.model.js';
import log from '../utils/logger.js';

export const applyForOrganizer = async (req, res, next) => {
  try {
    const { motivation } = req.body;
    const userId = req.user._id || req.user.id; // handle populated user or plain token id

    const existing = await OrganizerApplication.findOne({ userId, status: 'pending' });
    if (existing) {
      return next({ statusCode: 400, message: 'You already have a pending application.' });
    }

    const application = await OrganizerApplication.create({
      userId,
      motivation,
    });

    log.info('ORGANIZER_APPLICATION', `User ${userId} applied to be an organizer`);

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    log.error('ORGANIZER_APPLICATION_FAILED', err.message);
    next({ statusCode: 500, message: err.message });
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const applications = await OrganizerApplication.find()
      .populate('userId', 'fullName email college department')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next({ statusCode: 500, message: err.message });
  }
};

export const reviewApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return next({ statusCode: 400, message: 'Invalid status' });
    }

    const application = await OrganizerApplication.findById(id);
    if (!application) {
      return next({ statusCode: 404, message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return next({ statusCode: 400, message: `Application is already ${application.status}` });
    }

    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();

    if (status === 'approved') {
      const user = await User.findById(application.userId);
      if (user) {
        // Upgrade role to mentor so they can access the Admin/Organizer dashboard
        user.systemRole = 'mentor';
        await user.save();
        log.info('ORGANIZER_APPROVED', `User ${user.email} promoted to mentor`);
      }
    }

    res.status(200).json({ success: true, message: `Application ${status} successfully.` });
  } catch (err) {
    next({ statusCode: 500, message: err.message });
  }
};

export const getOrganizerHackathons = async (req, res, next) => {
  try {
    const hackathons = await Hackathon.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    // Enrich each hackathon with team + submission counts
    const enriched = await Promise.all(
      hackathons.map(async (h) => {
        const [teamCount, submissionCount] = await Promise.all([
          Team.countDocuments({ hackathonId: h._id }),
          Submission.countDocuments({ hackathonId: h._id }),
        ]);
        return { ...h.toObject(), teamCount, submissionCount };
      })
    );

    log.success('ORGANIZER_HACKATHONS', `Returning ${enriched.length} hackathons for ${req.user.email}`);
    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    log.error('ORGANIZER_HACKATHONS', 'Failed', err);
    next({ statusCode: 500, message: err.message });
  }
};
