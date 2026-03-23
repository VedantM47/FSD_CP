import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import User from '../models/user.model.js';
import Discussion from '../models/discussion.model.js';
import log from '../utils/logger.js';
import { getIO } from '../utils/socket.js';

// Helper — emit a calendar refresh signal to all connected clients
const emitCalendarUpdate = (action, hackathonId) => {
  try {
    getIO().emit('calendar:update', { action, hackathonId: hackathonId?.toString() });
    log.info('SOCKET', `Emitted calendar:update [${action}] for hackathon ${hackathonId}`);
  } catch (err) {
    // Socket not yet initialised (e.g. in tests) — safe to ignore
    log.warn('SOCKET', 'Could not emit calendar:update: ' + err.message);
  }
};


const MAX_JUDGES = 10;

/* ================= CREATE HACKATHON ================= */

export const createHackathon = async (req, res, next) => {
  try {
    log.info('CREATE_HACKATHON', 'Creating hackathon', { title: req.body.title, by: req.user?.email || 'unauthenticated' });

    // 🔥 NEW: Validate Team Sizes
    const { minTeamSize, maxTeamSize } = req.body;
    if (minTeamSize && maxTeamSize && Number(minTeamSize) > Number(maxTeamSize)) {
      return next({
        statusCode: 400,
        message: "Minimum team size cannot be greater than maximum team size.",
      });
    }

    const hackathonData = { ...req.body };
    if (req.file) {
      hackathonData.image = req.file.path;
    }

    const hackathon = await Hackathon.create(hackathonData);

    log.success('CREATE_HACKATHON', `Hackathon created: "${hackathon.title}" (id=${hackathon._id})`);

    // 🔔 Real-time: notify all calendar clients that new hackathon events exist
    emitCalendarUpdate('created', hackathon._id);

    res.status(201).json({
      success: true,
      data: hackathon,
    });
  } catch (err) {
    log.error('CREATE_HACKATHON', 'Failed to create hackathon', err);
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
    log.info('GET_ALL_HACKATHONS', 'Fetching all hackathons');
    const hackathons = await Hackathon.find().sort({ createdAt: -1 });

    log.success('GET_ALL_HACKATHONS', `Returning ${hackathons.length} hackathons`);
    res.status(200).json({
      success: true,
      count: hackathons.length,
      data: hackathons,
    });
  } catch (err) {
    log.error('GET_ALL_HACKATHONS', 'Failed to fetch hackathons', err);
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
    log.info('GET_HACKATHON', `Fetching hackathon`, { id: req.params.id });
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      log.warn('GET_HACKATHON', `Not found: ${req.params.id}`);
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    log.success('GET_HACKATHON', `Found: "${hackathon.title}"`);
    res.status(200).json({
      success: true,
      data: hackathon,
    });
  } catch (err) {
    log.error('GET_HACKATHON', 'Failed to fetch hackathon', err);
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
    log.info('ASSIGN_JUDGE', 'Assigning judge', { hackathonId, judgeUserId, by: req.user?.email });


    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      log.warn('ASSIGN_JUDGE', `Hackathon not found: ${hackathonId}`);
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    if (hackathon.judges.length >= MAX_JUDGES) {
      log.warn('ASSIGN_JUDGE', `Max judges reached: ${hackathon.judges.length}/${MAX_JUDGES}`);
      return next({
        statusCode: 400,
        message: `Maximum ${MAX_JUDGES} judges allowed for a hackathon`,
      });
    }

    const judgeUser = await User.findById(judgeUserId);
    if (!judgeUser) {
      log.warn('ASSIGN_JUDGE', `Judge user not found: ${judgeUserId}`);
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
      log.warn('ASSIGN_JUDGE', `User already a judge: ${judgeUser.email}`);
      return next({
        statusCode: 400,
        message: 'User already assigned as judge',
      });
    }

    // Add judge to hackathon
    hackathon.judges.push({ judgeUserId: judgeUserId, assignedAt: new Date() });
    await hackathon.save();

    // Add hackathon role to user
    judgeUser.hackathonRoles.push({
      hackathonId: hackathon._id,
      role: 'judge',
    });
    await judgeUser.save();

    log.success('ASSIGN_JUDGE', `Judge assigned: ${judgeUser.email} → "${hackathon.title}"`);
    res.status(200).json({
      success: true,
      message: 'Judge assigned successfully',
    });
  } catch (err) {
    log.error('ASSIGN_JUDGE', 'Failed to assign judge', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};


// ================= REMOVE JUDGE FROM HACKATHON =================
// Admin / Mentor / organizer
export const removeJudgeFromHackathon = async (req, res, next) => {
  try {
    const { hackathonId, judgeUserId } = req.params;
    log.info('REMOVE_JUDGE', 'Removing judge', { hackathonId, judgeUserId, by: req.user?.email });

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      log.warn('REMOVE_JUDGE', `Hackathon not found: ${hackathonId}`);
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    // Check judge exists in hackathon
    const isJudgeAssigned = hackathon.judges.some(
      (j) => j.judgeUserId.toString() === judgeUserId
    );

    const judgeUser = await User.findById(judgeUserId);
    if (!judgeUser) {
      log.warn('REMOVE_JUDGE', `Judge user not found: ${judgeUserId}`);
      return next({ statusCode: 404, message: "Judge user not found" });
    }

    if (!isJudgeAssigned) {
      log.warn('REMOVE_JUDGE', `User is not a judge for this hackathon: ${judgeUser.email}`);
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
    judgeUser.hackathonRoles = judgeUser.hackathonRoles.filter(
      (role) =>
        !(
          role.hackathonId.toString() === hackathonId &&
          role.role === 'judge'
        )
    );
    await judgeUser.save();

    log.success('REMOVE_JUDGE', `Judge removed: ${judgeUser.email} from "${hackathon.title}"`);
    res.status(200).json({
      success: true,
      message: 'Judge removed successfully',
    });
  } catch (err) {
    log.error('REMOVE_JUDGE', 'Failed to remove judge', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

// ================= SEARCH HACKATHONS =================

export const searchHackathons = async (req, res, next) => {
  try {
    const { q, status } = req.query;
    log.info('SEARCH_HACKATHONS', 'Searching hackathons', { query: q, status });

    const filter = {};

    if (q) {
      filter.title = { $regex: q, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    const hackathons = await Hackathon.find(filter)
      .select("title startDate endDate status maxTeamSize prizePool")
      .sort({ startDate: -1 });

    log.success('SEARCH_HACKATHONS', `Found ${hackathons.length} hackathons`);
    res.status(200).json({
      success: true,
      count: hackathons.length,
      data: hackathons
    });

  } catch (err) {
    log.error('SEARCH_HACKATHONS', 'Search failed', err);
    next({ statusCode: 500, message: err.message });
  }
};

/* ================= UPDATE HACKATHON ================= */
/* Admin / Mentor */
/* ================= UPDATE HACKATHON ================= */
/* Admin / Mentor */
export const updateHackathon = async (req, res, next) => {
  try {
    log.info('UPDATE_HACKATHON', 'Updating hackathon', { id: req.params.id, fields: Object.keys(req.body), by: req.user?.email });

    // 🔥 NEW: Validate Team Sizes during update
    const { minTeamSize, maxTeamSize, judges: newJudgeIds, ...updateData } = req.body;

    if (minTeamSize && maxTeamSize && Number(minTeamSize) > Number(maxTeamSize)) {
      return next({
        statusCode: 400,
        message: "Minimum team size cannot be greater than maximum team size.",
      });
    }

    // Include min/max team sizes in updateData
    if (minTeamSize) updateData.minTeamSize = minTeamSize;
    if (maxTeamSize) updateData.maxTeamSize = maxTeamSize;

    if (req.file) {
      updateData.image = req.file.path;
    }

    // 2. Format strings into the exact object structure Mongoose demands
    if (newJudgeIds && Array.isArray(newJudgeIds)) {
      updateData.judges = newJudgeIds.map(id => ({
        judgeUserId: id,
        assignedAt: new Date()
      }));
    }

    // 3. Save the Hackathon document
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!hackathon) {
      log.warn('UPDATE_HACKATHON', `Not found: ${req.params.id}`);
      return next({ statusCode: 404, message: 'Hackathon not found' });
    }

    // 4. BULLETPROOF SYNC: Judge roles synchronization
    if (newJudgeIds && Array.isArray(newJudgeIds)) {
      const incomingIds = newJudgeIds.map(id => id.toString());

      await User.updateMany(
        { 'hackathonRoles.hackathonId': hackathon._id, 'hackathonRoles.role': 'judge' },
        { $pull: { hackathonRoles: { hackathonId: hackathon._id, role: 'judge' } } }
      );

      if (incomingIds.length > 0) {
        await User.updateMany(
          { _id: { $in: incomingIds } },
          { $push: { hackathonRoles: { hackathonId: hackathon._id, role: 'judge' } } }
        );
      }

      log.info('UPDATE_HACKATHON', `Force-synced judge roles. Active judges: ${incomingIds.length}`);
    }

    log.success('UPDATE_HACKATHON', `Updated: "${hackathon.title}"`);

    // 🔔 Real-time: notify calendar clients that hackathon dates may have changed
    emitCalendarUpdate('updated', hackathon._id);

    res.status(200).json({
      success: true,
      data: hackathon,
    });
  } catch (err) {
    log.error('UPDATE_HACKATHON', 'Failed to update hackathon', err);
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
    log.info('UPDATE_STATUS', 'Updating hackathon status', { id: req.params.id, newStatus: status, by: req.user?.email });

    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      log.warn('UPDATE_STATUS', `Not found: ${req.params.id}`);
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    const oldStatus = hackathon.status;
    hackathon.status = status;
    await hackathon.save();

    /* Lock teams when hackathon starts */
    if (status === 'ongoing' || status === 'closed') {
      const result = await Team.updateMany(
        { hackathonId: hackathon._id },
        { isLocked: true }
      );
      log.info('UPDATE_STATUS', `Locked ${result.modifiedCount} teams`);
    }

    log.success('UPDATE_STATUS', `Status changed: "${hackathon.title}" ${oldStatus} → ${status}`);

    // 🔔 Real-time: status changes may make hackathon visible/invisible on the calendar
    emitCalendarUpdate('status_changed', hackathon._id);

    res.status(200).json({
      success: true,
      message: `Hackathon status updated to ${status}`,
    });
  } catch (err) {
    log.error('UPDATE_STATUS', 'Failed to update status', err);
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
    log.info('DELETE_HACKATHON', 'Deleting hackathon', { id: req.params.id, by: req.user?.email });
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);

    if (!hackathon) {
      log.warn('DELETE_HACKATHON', `Not found: ${req.params.id}`);
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    log.success('DELETE_HACKATHON', `Deleted: "${hackathon.title}"`);
    res.status(200).json({
      success: true,
      message: 'Hackathon deleted successfully',
    });
  } catch (err) {
    log.error('DELETE_HACKATHON', 'Failed to delete hackathon', err);
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
    log.info('GET_TEAMS_BY_HACKATHON', 'Fetching teams', { hackathonId });

    const teams = await Team.find({ hackathonId })
      .populate('leader', 'fullName email privacySettings')
      .populate('members.userId', 'fullName email privacySettings');

    // Enforce privacy settings to hide emails where requested
    const sanitizedTeams = teams.map((t) => {
      const teamObj = t.toObject();
      if (teamObj.leader && teamObj.leader.privacySettings?.showEmail === false) {
        teamObj.leader.email = 'Hidden by User';
      }
      if (teamObj.members) {
        teamObj.members.forEach((m) => {
          if (m.userId && m.userId.privacySettings?.showEmail === false) {
            m.userId.email = 'Hidden by User';
          }
        });
      }
      return teamObj;
    });

    log.success('GET_TEAMS_BY_HACKATHON', `Found ${sanitizedTeams.length} teams`);
    res.status(200).json({
      success: true,
      count: sanitizedTeams.length,
      data: sanitizedTeams,
    });
  } catch (err) {
    log.error('GET_TEAMS_BY_HACKATHON', 'Failed to fetch teams', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ================= GET DISCUSSIONS BY HACKATHON ================= */
export const getDiscussionsByHackathon = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    log.info('GET_DISCUSSIONS', 'Fetching discussions', { hackathonId });

    const discussions = await Discussion.find({ hackathonId })
      .populate('senderId', 'fullName email systemRole')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: discussions,
    });
  } catch (err) {
    log.error('GET_DISCUSSIONS', 'Failed to fetch discussions', err);
    next({ statusCode: 500, message: err.message });
  }
};