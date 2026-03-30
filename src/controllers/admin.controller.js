import mongoose from 'mongoose';
import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import Submission from '../models/submission.model.js';
import User from '../models/user.model.js';
import log from '../utils/logger.js';
import { sendEmail, getQueueStatus } from '../utils/email.js';

/* ================= ADMIN DASHBOARD ================= */
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

    log.success('ADMIN_DASHBOARD', 'Stats fetched', {
      totalHackathons,
      totalTeams,
      totalSubmissions,
      totalUsers,
      activeHackathons,
    });

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

/* ================= ADMIN HACKATHONS ================= */
export const getAdminHackathons = async (req, res, next) => {
  try {
    log.info('ADMIN_HACKATHONS', 'Fetching hackathons list', { by: req.user?.email });

    const hackathons = await Hackathon.find()
      .sort({ createdAt: -1 })
      .lean();

    const formatted = hackathons.map((h) => ({
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
    next({
      statusCode: 500,
      message: 'Failed to fetch hackathons',
      error: err.message,
    });
  }
};

/* ================= ADMIN HACKATHON OVERVIEW ================= */
export const getHackathonOverview = async (req, res, next) => {
  try {
    const hackathonId = req.params.id;

    // FIX: Validate that the provided hackathon ID is a valid ObjectId
    if (!mongoose.isValidObjectId(hackathonId)) {
      return next({ statusCode: 400, message: 'Invalid hackathon ID' });
    }

    log.info('ADMIN_OVERVIEW', 'Fetching hackathon overview', {
      hackathonId,
      by: req.user?.email,
    });

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
    next({
      statusCode: 500,
      message: 'Failed to fetch hackathon overview',
      error: err.message,
    });
  }
};

/* ================= ADMIN SUBMISSIONS ================= */
export const getAdminSubmissions = async (req, res, next) => {
  try {
    log.info('ADMIN_SUBMISSIONS', 'Fetching all submissions', { by: req.user?.email });

    /*
     * FIX: Added pagination to prevent fetching all documents at once,
     * which would cause memory issues and slow responses at scale.
     */
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      Submission.find()
        .populate('hackathonId', 'title')
        .populate('teamId', 'name')
        .populate('submittedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Submission.countDocuments(),
    ]);

    log.success('ADMIN_SUBMISSIONS', `Returning ${submissions.length} of ${total} submissions`);
    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    log.error('ADMIN_SUBMISSIONS', 'Failed to fetch submissions', err);
    next({
      statusCode: 500,
      message: 'Failed to fetch submissions',
      error: err.message,
    });
  }
};

/* ================= ADMIN TEAMS ================= */
export const getAdminTeams = async (req, res, next) => {
  try {
    log.info('ADMIN_TEAMS', 'Fetching all teams', { by: req.user?.email });

    /*
     * FIX: Added pagination to prevent fetching all documents at once.
     */
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [teams, total] = await Promise.all([
      Team.find()
        .populate('hackathonId', 'title')
        .populate('leader', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Team.countDocuments(),
    ]);

    log.success('ADMIN_TEAMS', `Returning ${teams.length} of ${total} teams`);
    res.status(200).json({
      success: true,
      data: teams,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    log.error('ADMIN_TEAMS', 'Failed to fetch teams', err);
    next({
      statusCode: 500,
      message: 'Failed to fetch teams',
      error: err.message,
    });
  }
};

/* ================= GET ALL JUDGES ================= */
export const getAllJudges = async (req, res, next) => {
  try {
    log.info('GET_JUDGES', 'Fetching all judges', { by: req.user?.email });

    /*
     * FIX: Previously queried `systemRole: 'judge'` but 'judge' was not in the
     * systemRole enum, so this always returned 0 results.
     * Now that 'judge' is added to the systemRole enum in user.model.js, this works correctly.
     */
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
    next({
      statusCode: 500,
      message: 'Failed to fetch judges',
      error: err.message,
    });
  }
};

/* ================= ASSIGN JUDGES TO HACKATHON ================= */
export const assignJudgesToHackathon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { judgeIds } = req.body;

    log.info('ASSIGN_JUDGES_BULK', 'Bulk assigning judges', {
      hackathonId: id,
      judgeCount: judgeIds?.length,
      by: req.user?.email,
    });

    // FIX: Validate the hackathon ID format before hitting the database
    if (!mongoose.isValidObjectId(id)) {
      return next({ statusCode: 400, message: 'Invalid hackathon ID' });
    }

    // Validate judgeIds is a non-empty array
    if (!Array.isArray(judgeIds) || judgeIds.length === 0) {
      log.warn('ASSIGN_JUDGES_BULK', 'judgeIds is not a valid non-empty array');
      return next({
        statusCode: 400,
        message: 'judgeIds must be a non-empty array',
      });
    }

    // FIX: Cap the number of judges that can be assigned in one request
    if (judgeIds.length > 50) {
      return next({
        statusCode: 400,
        message: 'Cannot assign more than 50 judges at once',
      });
    }

    // FIX: Validate every ID in the array is a proper MongoDB ObjectId
    const invalidIds = judgeIds.filter((jid) => !mongoose.isValidObjectId(jid));
    if (invalidIds.length > 0) {
      log.warn('ASSIGN_JUDGES_BULK', 'Invalid ObjectIds detected', { invalidIds });
      return next({
        statusCode: 400,
        message: `Invalid judge IDs provided: ${invalidIds.join(', ')}`,
      });
    }

    // FIX: Verify every provided judge ID actually exists in the database
    const existingUsers = await User.find({ _id: { $in: judgeIds } }).select('_id');
    if (existingUsers.length !== judgeIds.length) {
      log.warn('ASSIGN_JUDGES_BULK', 'Some judgeIds do not match existing users');
      return next({
        statusCode: 400,
        message: 'One or more judgeIds do not correspond to existing users',
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

    // Filter out judges that are already assigned to this hackathon
    const existingJudgeIds = new Set(
      hackathon.judges.map((j) => j.judgeUserId.toString())
    );
    const newJudgeIds = judgeIds.filter((judgeId) => !existingJudgeIds.has(judgeId));

    if (newJudgeIds.length > 0) {
      // Push new judges into the hackathon's judges array
      newJudgeIds.forEach((judgeId) => {
        hackathon.judges.push({
          judgeUserId: judgeId,
          assignedAt: new Date(),
        });
      });
      await hackathon.save();

      /*
       * FIX: Use $push with a conditional $elemMatch filter instead of $addToSet.
       * $addToSet compares whole objects and can be unreliable with mixed ObjectId/string types.
       * This approach explicitly checks for an existing entry before pushing.
       */
      await User.updateMany(
        {
          _id: { $in: newJudgeIds },
          hackathonRoles: {
            $not: {
              $elemMatch: { hackathonId: id, role: 'judge' },
            },
          },
        },
        {
          $push: {
            hackathonRoles: {
              hackathonId: id,
              role: 'judge',
            },
          },
        }
      );
    }

    log.success(
      'ASSIGN_JUDGES_BULK',
      `Judges assigned: ${newJudgeIds.length} new, ${judgeIds.length - newJudgeIds.length} already existed`
    );

    res.status(200).json({
      success: true,
      message: `${newJudgeIds.length} new judge(s) assigned and roles synchronized.`,
      data: {
        newlyAssigned: newJudgeIds.length,
        alreadyExisted: judgeIds.length - newJudgeIds.length,
      },
    });
  } catch (err) {
    log.error('ASSIGN_JUDGES_BULK', 'Failed to assign judges', err);
    next({
      statusCode: 500,
      message: 'Failed to assign judges',
      error: err.message,
    });
  }
};

/* ================= EMAIL BROADCAST ================= */
export const broadcastEmail = async (req, res, next) => {
  try {
    const { subject, body, targetGroup, hackathonId } = req.body;
    log.info('BROADCAST_EMAIL', 'Admin broadcasting email', { subject, targetGroup, hackathonId, by: req.user?.email });

    if (!subject || !body || !targetGroup) {
       return next({ statusCode: 400, message: "Subject, body, and targetGroup are required." });
    }

    let users = [];
    if (targetGroup === 'all_users') {
      // Find all valid users who haven't explicitly disabled emails
      users = await User.find({ "notificationPreferences.emailAlerts": { $ne: false } }).select('email');
    } else if (targetGroup === 'hackathon_participants') {
      if (!hackathonId) return next({ statusCode: 400, message: "hackathonId is required for participants." });
      users = await User.find({
        "hackathonRoles.hackathonId": hackathonId,
        "hackathonRoles.role": "participant",
        "notificationPreferences.emailAlerts": { $ne: false }
      }).select('email');
    } else {
      return next({ statusCode: 400, message: "Invalid target group" });
    }

    if (!users.length) {
      log.warn('BROADCAST_EMAIL', 'No users found matching criteria to broadcast to.');
      return res.status(200).json({ success: true, message: "No users found matching criteria or all users opted-out." });
    }

    // Send emails
    const promises = users.map(user => 
      sendEmail({
        to: user.email,
        subject: subject,
        html: body
      })
    );

    const results = await Promise.allSettled(promises);
    const successfulCount = results.filter(r => r.status === 'fulfilled' && r.value !== false).length;

    log.success('BROADCAST_EMAIL', `Successfully fired ${successfulCount} emails out of ${users.length} attempts.`);

    res.status(200).json({ 
      success: true, 
      message: `Email broadcast dispatched securely to ${successfulCount} unique recipients.` 
    });
  } catch (err) {
    log.error('BROADCAST_EMAIL', 'Broadcast failed', err);
    next({ statusCode: 500, message: err.message });
  }
};

/* ================= EMAIL QUEUE STATUS ================= */
export const getEmailQueueStatus = async (req, res) => {
  const status = getQueueStatus();
  res.status(200).json({ success: true, data: status });
};

/* ================= GET USERS WITH PAGINATION & SEARCH ================= */
export const getAdminUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    log.info('GET_ADMIN_USERS', 'Fetching users with pagination', { 
      page, 
      limit, 
      search: search || 'none',
      by: req.user?.email 
    });

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per page
    const skip = (pageNum - 1) * limitNum;

    // Build comprehensive search filter
    let filter = {};
    if (search && search.trim()) {
      const searchTerm = search.trim();
      
      // Create regex for partial matching (case-insensitive)
      const searchRegex = new RegExp(searchTerm.split(' ').map(term => 
        term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex characters
      ).join('.*'), 'i');
      
      // Search across multiple fields
      filter = {
        $or: [
          { fullName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { college: searchRegex },
          { department: searchRegex },
          { systemRole: searchRegex },
          { bio: searchRegex },
          { skills: { $in: [searchRegex] } },
          { interests: { $in: [searchRegex] } }
        ]
      };
    }

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('fullName email systemRole hackathonRoles phone college department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    log.success('GET_ADMIN_USERS', `Returning ${users.length} of ${total} users (page ${pageNum})`);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    log.error('GET_ADMIN_USERS', 'Failed to fetch users', err);
    next({
      statusCode: 500,
      message: 'Failed to fetch users',
      error: err.message,
    });
  }
};

/* ================= UPDATE USER ROLE ================= */
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId, systemRole, hackathonId, hackathonRole } = req.body;
    log.info('UPDATE_USER_ROLE', 'Role update request', { userId, systemRole, hackathonId, hackathonRole, by: req.user?.email });

    // Validation
    if (!userId) {
      return next({ statusCode: 400, message: 'userId is required.' });
    }

    if (!systemRole && !hackathonRole) {
      return next({ statusCode: 400, message: 'At least one role (systemRole or hackathonRole) must be provided.' });
    }

    // Find user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return next({ statusCode: 404, message: 'User not found.' });
    }

    // Update systemRole if provided
    if (systemRole) {
      const validRoles = ['user', 'admin', 'mentor', 'judge'];
      if (!validRoles.includes(systemRole)) {
        return next({ statusCode: 400, message: `Invalid systemRole. Must be one of: ${validRoles.join(', ')}` });
      }
      targetUser.systemRole = systemRole;
      log.info('UPDATE_USER_ROLE', `Updating systemRole to: ${systemRole}`);
    }

    // Update hackathon-specific role if provided
    if (hackathonId && hackathonRole) {
      const validHackRoles = ['participant', 'judge', 'organizer'];
      if (!validHackRoles.includes(hackathonRole)) {
        return next({ statusCode: 400, message: `Invalid hackathonRole. Must be one of: ${validHackRoles.join(', ')}` });
      }

      const hackathon = await Hackathon.findById(hackathonId);
      if (!hackathon) {
        return next({ statusCode: 404, message: 'Hackathon not found.' });
      }

      // Remove any existing role for this hackathon
      targetUser.hackathonRoles = targetUser.hackathonRoles.filter(
        r => !r.hackathonId.equals(hackathonId)
      );
      
      // Add new role
      targetUser.hackathonRoles.push({ hackathonId, role: hackathonRole });
      log.info('UPDATE_USER_ROLE', `Adding hackathon role: ${hackathonRole} for hackathon: ${hackathonId}`);

      // If assigning as judge, also update the hackathon.judges array
      if (hackathonRole === 'judge') {
        const alreadyJudge = hackathon.judges.some(j => j.judgeUserId.equals(userId));
        if (!alreadyJudge) {
          hackathon.judges.push({ judgeUserId: userId, assignedAt: new Date() });
          await hackathon.save();
          log.info('UPDATE_USER_ROLE', `Added user to hackathon.judges array`);
        }
      }
    }

    // Save user with updated roles
    await targetUser.save();

    log.success('UPDATE_USER_ROLE', `Role updated successfully for ${targetUser.email}`);
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully.',
      data: {
        _id: targetUser._id,
        fullName: targetUser.fullName,
        email: targetUser.email,
        systemRole: targetUser.systemRole,
        hackathonRoles: targetUser.hackathonRoles,
      },
    });
  } catch (err) {
    log.error('UPDATE_USER_ROLE', 'Failed to update role', err);
    next({ statusCode: 500, message: err.message });
  }
};