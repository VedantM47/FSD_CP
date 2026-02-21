import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import Submission from '../models/submission.model.js';
import User from '../models/user.model.js';
import log from '../utils/logger.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    log.info('ADMIN_DASHBOARD', 'Fetching admin dashboard stats', { by: req.user?.email });

    const [
      totalHackathons,
      totalTeams,
      totalSubmissions,
      totalUsers,
      activeHackathons,
    ] = await Promise.all([
      Hackathon.countDocuments(),
      Team.countDocuments(),
      Submission.countDocuments(),
      User.countDocuments(),
      Hackathon.countDocuments({ status: 'ongoing' }),
    ]);

    log.success('ADMIN_DASHBOARD', 'Stats fetched', { totalHackathons, totalTeams, totalSubmissions, totalUsers, activeHackathons });
    res.status(200).json({
      success: true,
      data: {
        hackathons: totalHackathons,
        activeHackathons,
        teams: totalTeams,
        submissions: totalSubmissions,
        users: totalUsers,
      },
    });
  } catch (err) {
    log.error('ADMIN_DASHBOARD', 'Failed to load dashboard', err);
    next({
      statusCode: 500,
      message: 'Failed to load admin dashboard stats',
      error: err.message,
    });
  }
};

export const getAdminHackathons = async (req, res, next) => {
  try {
    log.info('ADMIN_HACKATHONS', 'Fetching hackathons list', { by: req.user?.email });

    const hackathons = await Hackathon.find()
      .sort({ createdAt: -1 })
      .lean();

    const formatted = hackathons.map(h => ({
      _id: h._id,
      title: h.title,
      name: h.title,
      status: h.status,
      startDate: h.startDate,
      endDate: h.endDate,
      judgesCount: h.judges?.length || 0,
    }));

    log.success('ADMIN_HACKATHONS', `Returning ${formatted.length} hackathons`);
    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    log.error('ADMIN_HACKATHONS', 'Failed to fetch hackathons', err);
    next(err);
  }
};


/* ================= ADMIN HACKATHON OVERVIEW ================= */
export const getHackathonOverview = async (req, res, next) => {
  try {
    const hackathonId = req.params.id;
    log.info('ADMIN_OVERVIEW', 'Fetching hackathon overview', { hackathonId, by: req.user?.email });

    const [teamsCount, submissionsCount] = await Promise.all([
      Team.countDocuments({ hackathonId }),
      Submission.countDocuments({ hackathonId }),
    ]);

    log.success('ADMIN_OVERVIEW', 'Overview fetched', { teamsCount, submissionsCount });
    res.status(200).json({
      success: true,
      data: {
        teamsCount,
        submissionsCount,
      },
    });
  } catch (err) {
    log.error('ADMIN_OVERVIEW', 'Failed to fetch overview', err);
    next(err);
  }
};

/* ================= ADMIN SUBMISSIONS ================= */
export const getAdminSubmissions = async (req, res, next) => {
  try {
    log.info('ADMIN_SUBMISSIONS', 'Fetching all submissions', { by: req.user?.email });

    const submissions = await Submission.find()
      .populate('hackathonId', 'title')
      .populate('teamId', 'name')
      .populate('submittedBy', 'fullName email')
      .sort({ createdAt: -1 });

    log.success('ADMIN_SUBMISSIONS', `Returning ${submissions.length} submissions`);
    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (err) {
    log.error('ADMIN_SUBMISSIONS', 'Failed to fetch submissions', err);
    next(err);
  }
};

/* ================= ADMIN TEAMS ================= */
export const getAdminTeams = async (req, res, next) => {
  try {
    log.info('ADMIN_TEAMS', 'Fetching all teams', { by: req.user?.email });

    const teams = await Team.find()
      .populate('hackathonId', 'title')
      .populate('leader', 'fullName email')
      .sort({ createdAt: -1 });

    log.success('ADMIN_TEAMS', `Returning ${teams.length} teams`);
    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (err) {
    log.error('ADMIN_TEAMS', 'Failed to fetch teams', err);
    next(err);
  }
};

// fetch all judges for admin dropdown
export const getAllJudges = async (req, res, next) => {
  try {
    log.info('GET_JUDGES', 'Fetching all judges', { by: req.user?.email });

    const judges = await User.find({
      systemRole: 'judge',
    }).select('_id fullName email');

    log.success('GET_JUDGES', `Found ${judges.length} judges`);
    res.status(200).json({
      success: true,
      data: judges,
    });
  } catch (err) {
    log.error('GET_JUDGES', 'Failed to fetch judges', err);
    next(err);
  }
};

export const assignJudgesToHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { judgeIds } = req.body;
    log.info('ASSIGN_JUDGES_BULK', 'Bulk assigning judges', { hackathonId: id, judgeCount: judgeIds?.length, by: req.user?.email });

    if (!Array.isArray(judgeIds)) {
      log.warn('ASSIGN_JUDGES_BULK', 'judgeIds is not an array');
      return next({
        statusCode: 400,
        message: 'judgeIds must be an array',
      });
    }

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      log.warn('ASSIGN_JUDGES_BULK', `Hackathon not found: ${id}`);
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    // avoid duplicate judges
    const existingJudgeIds = new Set(
      hackathon.judges.map(j => j.judgeUserId.toString())
    );

    let added = 0;
    judgeIds.forEach(judgeId => {
      if (!existingJudgeIds.has(judgeId)) {
        hackathon.judges.push({
          judgeUserId: judgeId,
          assignedAt: new Date(),
        });
        added++;
      }
    });

    await hackathon.save();

    log.success('ASSIGN_JUDGES_BULK', `Judges assigned: ${added} new, ${judgeIds.length - added} already existed`);
    res.status(200).json({
      success: true,
      message: 'Judges assigned successfully',
    });
  } catch (err) {
    log.error('ASSIGN_JUDGES_BULK', 'Failed to assign judges', err);
    next(err);
  }
};
