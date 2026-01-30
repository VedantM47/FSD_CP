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
      .select('title status startDate endDate judges')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: hackathons,
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
