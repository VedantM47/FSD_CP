import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';

/* ================= CREATE HACKATHON ================= */
/* Admin / Faculty */
export const createHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.create({
      ...req.body,
      createdBy: req.user._id,
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

/* ================= UPDATE HACKATHON ================= */
/* Admin / Faculty */
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
/* Admin / Faculty */
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