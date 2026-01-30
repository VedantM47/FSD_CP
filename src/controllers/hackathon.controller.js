import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import User from '../models/user.model.js';


const MAX_JUDGES = 10;

/* ================= CREATE HACKATHON ================= */

export const createHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.create({
      ...req.body,
      // TEMP: auth disabled
      // createdBy will be added when auth is enabled
    });

    res.status(201).json({
      success: true,
      data: hackathon,
    });
  } catch (err) {
    next({
      statusCode: 400,
      message: err.message,
    });
  }
};


/* ================= GET ALL HACKATHONS ================= */
/* Public */
export const getAllHackathons = async (req, res, next) => {
  try {
    const hackathons = await Hackathon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      data: hackathons,
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ================= GET HACKATHON BY ID ================= */
/* Public */
export const getHackathonById = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    res.status(200).json({
      success: true,
      data: hackathon,
    });
  } catch (err) {
    next({
      statusCode: 400,
      message: err.message,
    });
  }
};

/* ================= ADD JUDGE TO HACKATHON ================= */
/* Admin / Mentor / organizer */
export const assignJudgeToHackathon = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const { judgeUserId } = req.body;

    
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    if (hackathon.judges.length >= MAX_JUDGES) {
      return next({
        statusCode: 400,
        message: `Maximum ${MAX_JUDGES} judges allowed for a hackathon`,
      });
    }
    
    const judgeUser = await User.findById(judgeUserId);
    if (!judgeUser) {
      return next({
        statusCode: 404,
        message: 'User not found',
      });
    }
    
    // Prevent duplicate assignment
    const alreadyJudge = hackathon.judges.some(
      (j) => j.judgeUserId.toString() === judgeUserId
    );

    if (alreadyJudge) {
      return next({
        statusCode: 400,
        message: 'User already assigned as judge',
      });
    }

    // Add judge to hackathon
    hackathon.judges.push({judgeUserId: judgeUserId, assignedAt: new Date()});
    await hackathon.save();

    // Add hackathon role to user
    judgeUser.hackathonRoles.push({
      hackathonId: hackathon._id,
      role: 'judge',
    });
    await judgeUser.save();

    res.status(200).json({
      success: true,
      message: 'Judge assigned successfully',
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};


// ================= REMOVE JUDGE FROM HACKATHON =================
// *//* Admin / Mentor / organizer */
export const removeJudgeFromHackathon = async (req, res, next) => {
  try {
    const { hackathonId, judgeUserId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    // Check judge exists in hackathon
    const isJudgeAssigned = hackathon.judges.some(
  (j) => j.judgeUserId.toString() === judgeUserId
);

    if (!isJudgeAssigned) {
      return next({
        statusCode: 400,
        message: 'User is not a judge for this hackathon',
      });
    }

    // Remove judge from hackathon
    hackathon.judges = hackathon.judges.filter(
      (j) => j.judgeUserId.toString() !== judgeUserId
    );
    await hackathon.save();

    // Remove hackathonRole from user
    const judgeUser = await User.findById(judgeUserId);
    if (judgeUser) {
      judgeUser.hackathonRoles = judgeUser.hackathonRoles.filter(
        (role) =>
          !(
            role.hackathonId.toString() === hackathonId &&
            role.role === 'judge'
          )
      );
      await judgeUser.save();
    }

    res.status(200).json({
      success: true,
      message: 'Judge removed successfully',
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ================= UPDATE HACKATHON ================= */
/* Admin / Mentor */
export const updateHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!hackathon) {
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    res.status(200).json({
      success: true,
      data: hackathon,
    });
  } catch (err) {
    next({
      statusCode: 400,
      message: err.message,
    });
  }
};

/* ================= UPDATE HACKATHON STATUS ================= */
/* Admin / Mentor */
export const updateHackathonStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    hackathon.status = status;
    await hackathon.save();

    /* 🔒 Lock teams when hackathon starts */
    if (status === 'ongoing' || status === 'closed') {
      await Team.updateMany(
        { hackathonId: hackathon._id },
        { isLocked: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `Hackathon status updated to ${status}`,
    });
  } catch (err) {
    next({
      statusCode: 400,
      message: err.message,
    });
  }
};

/* ================= DELETE HACKATHON ================= */
/* Admin only */
export const deleteHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);

    if (!hackathon) {
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hackathon deleted successfully',
    });
  } catch (err) {
    next({
      statusCode: 400,
      message: err.message,
    });
  }
};

/* ================= GET TEAMS BY HACKATHON ================= */
/* Public */
export const getTeamsByHackathon = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;

    const teams = await Team.find({ hackathonId })
      .populate('leader', 'fullName email')
      .populate('members.userId', 'fullName email');

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};