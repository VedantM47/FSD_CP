import Team from '../models/team.model.js';

/* ================= CREATE TEAM ================= */
export const createTeam = async (req, res, next) => {
  try {
    const { name, hackathonId, maxSize } = req.body;

    const team = await Team.create({
      name,
      hackathonId,
      leader: req.user._id,
      maxSize,
      members: [
        {
          userId: req.user._id,
          status: 'accepted',
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: team,
    });
  } catch (err) {
    next({ statusCode: 400, message: err.message });
  }
};

/* ================= GET TEAM DETAILS ================= */
export const getTeamDetails = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate('leader', 'fullName email')
      .populate('members.userId', 'fullName email');

    if (!team) {
      return next({
        statusCode: 404,
        message: 'Team not found',
      });
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ================= REQUEST JOIN TEAM ================= */
export const requestJoinTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);

    team.members.push({
      userId: req.user._id,
      status: 'pending',
    });

    await team.save();

    res.status(200).json({
      success: true,
      message: 'Join request sent',
    });
  } catch (err) {
    next({ statusCode: 400, message: err.message });
  }
};

/* ================= ACCEPT / REJECT MEMBER ================= */
export const manageTeamMember = async (req, res, next) => {
  try {
    const { memberId, status } = req.body; // accepted | rejected

    const team = await Team.findById(req.params.teamId);

    const member = team.members.find(
      (m) => m.userId.toString() === memberId
    );

    if (!member) {
      return next({ statusCode: 404, message: 'Member not found' });
    }

    member.status = status;
    await team.save();

    res.status(200).json({
      success: true,
      message: `Member ${status}`,
    });
  } catch (err) {
    next({ statusCode: 400, message: err.message });
  }
};


// ================= GET PENDING JOIN REQUESTS ================= */
export const getPendingJoinRequests = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate('members.userId', 'fullName email');

    if (!team) {
      return next({
        statusCode: 404,
        message: 'Team not found',
      });
    }

    const pendingMembers = team.members.filter(
      (member) => member.status === 'pending'
    );

    res.status(200).json({
      success: true,
      count: pendingMembers.length,
      data: pendingMembers,
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ================= UPDATE TEAM ================= */
export const updateTeam = async (req, res, next) => {
  try {
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.teamId,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedTeam,
    });
  } catch (err) {
    next({ statusCode: 400, message: err.message });
  }
};

/* ================= LEAVE TEAM ================= */
export const leaveTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);

    team.members = team.members.filter(
      (m) => m.userId.toString() !== req.user._id.toString()
    );

    await team.save();

    res.status(200).json({
      success: true,
      message: 'Left team successfully',
    });
  } catch (err) {
    next({ statusCode: 400, message: err.message });
  }
};

//* ================= DELETE TEAM ================= */
export const deleteTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findByIdAndDelete(teamId);

    if (!team) {
      return next({
        statusCode: 404,
        message: 'Team not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};