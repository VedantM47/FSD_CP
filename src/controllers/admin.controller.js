import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import Submission from '../models/submission.model.js';
import User from '../models/user.model.js';

export const getAdminDashboard = async (req, res, next) => {
  console.log('🔥 ADMIN DASHBOARD HIT');
  try {
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
    next({
      statusCode: 500,
      message: 'Failed to load admin dashboard stats',
      error: err.message,
    });
  }
};

export const getAdminHackathons = async (req, res, next) => {
  try {
    const hackathons = await Hackathon.find()
      .sort({ createdAt: -1 })
      .lean();

    const formatted = hackathons.map(h => ({
      _id: h._id,
      title: h.title,        // frontend uses this
      name: h.title,         // fallback for old components
      status: h.status,
      startDate: h.startDate,
      endDate: h.endDate,
      judgesCount: h.judges?.length || 0,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};




/* ================= ADMIN HACKATHON OVERVIEW ================= */
export const getHackathonOverview = async (req, res, next) => {
  try {
    const hackathonId = req.params.id;

    const [teamsCount, submissionsCount] = await Promise.all([
      Team.countDocuments({ hackathonId }),
      Submission.countDocuments({ hackathonId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        teamsCount,
        submissionsCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ================= ADMIN SUBMISSIONS ================= */
export const getAdminSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find()
      .populate('hackathonId', 'title')
      .populate('teamId', 'name')
      .populate('submittedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= ADMIN TEAMS ================= */
export const getAdminTeams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate('hackathonId', 'title')
      .populate('leader', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (err) {
    next(err);
  }
};

// fetch all judges for admin dropdown
export const getAllJudges = async (req, res, next) => {
  try {
    const judges = await User.find({
      systemRole: 'judge',
    }).select('_id fullName email');

    res.status(200).json({
      success: true,
      data: judges,
    });
  } catch (err) {
    next(err);
  }
};
export const assignJudgesToHackathon = async (req, res, next) => {
  try {
    const { id } = req.params; // hackathon id
    const { judgeIds } = req.body; // array of userIds

    if (!Array.isArray(judgeIds)) {
      return next({
        statusCode: 400,
        message: 'judgeIds must be an array',
      });
    }

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    // avoid duplicate judges
    const existingJudgeIds = new Set(
      hackathon.judges.map(j => j.judgeUserId.toString())
    );

    judgeIds.forEach(judgeId => {
      if (!existingJudgeIds.has(judgeId)) {
        hackathon.judges.push({
          judgeUserId: judgeId,
          assignedAt: new Date(),
        });
      }
    });

    await hackathon.save();

    res.status(200).json({
      success: true,
      message: 'Judges assigned successfully',
    });
  } catch (err) {
    next(err);
  }
};
