import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import User from '../models/user.model.js';
import Submission from '../models/submission.model.js';
import log from '../utils/logger.js';
import { getIO } from '../utils/socket.js';
import mongoose from 'mongoose';

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

    // Explicitly set the creator ID
    const hackathonData = {
      ...req.body,
      createdBy: req.user._id
    };

    // 1. Parse and Validate Domains (NEW)
    let domains = [];
    if (hackathonData.domains) {
      try {
        domains = typeof hackathonData.domains === 'string'
          ? JSON.parse(hackathonData.domains)
          : hackathonData.domains;

        if (!Array.isArray(domains)) {
          domains = [];
        }

        // Validate each domain
        domains = domains.map((domain, index) => ({
          id: domain.id || domain.name.toLowerCase().replace(/\s+/g, '-'),
          name: domain.name?.trim() || '',
          description: domain.description?.trim() || '',
          icon: domain.icon?.substring(0, 5) || '🏷️',
          order: domain.order || index + 1,
          createdAt: new Date(),
        }));

        hackathonData.domains = domains;

        // Set defaults if not provided
        if (hackathonData.multiDomainSelection === undefined) {
          hackathonData.multiDomainSelection = true;
        }
        if (hackathonData.allowDomainSelection === undefined) {
          hackathonData.allowDomainSelection = true;
        }
        if (!hackathonData.maxDomainsPerEntry) {
          hackathonData.maxDomainsPerEntry = 3;
        }
      } catch (error) {
        log.warn('CREATE_HACKATHON', 'Error parsing domains', error);
        hackathonData.domains = [];
      }
    }

    // 2. Parse Judges
    let judgeIds = [];
    if (hackathonData.judges) {
      judgeIds = typeof hackathonData.judges === 'string' ? JSON.parse(hackathonData.judges) : hackathonData.judges;
      hackathonData.judges = Array.isArray(judgeIds) ? judgeIds.map(id => ({ judgeUserId: id, assignedAt: new Date() })) : [];
    }

    if (judgeIds.length > MAX_JUDGES) {
      return next({ statusCode: 400, message: `Maximum ${MAX_JUDGES} judges allowed.` });
    }

    // 3. Parse Organizers
    let organizerIds = [];
    if (hackathonData.organizers) {
      organizerIds = typeof hackathonData.organizers === 'string' ? JSON.parse(hackathonData.organizers) : hackathonData.organizers;

      // Ensure the creator is always in the organizer list
      if (!organizerIds.includes(req.user._id.toString())) {
        organizerIds.push(req.user._id.toString());
      }

      // FIX: Standardized key to 'userId'
      hackathonData.organizers = organizerIds.map(id => ({
       organizerUserId: id,
        assignedAt: new Date()
      }));
    }

    // 4. Validate Team Sizes
    if (hackathonData.minTeamSize && hackathonData.maxTeamSize && Number(hackathonData.minTeamSize) > Number(hackathonData.maxTeamSize)) {
      return next({ statusCode: 400, message: "Minimum team size cannot be greater than maximum team size." });
    }

    if (req.file) hackathonData.image = req.file.path;

    // 5. Save Hackathon
    const hackathon = await Hackathon.create(hackathonData);

    // 6. Sync User Roles (Handshake) - Use 'hId' to match middleware context
    if (judgeIds.length > 0) {
      await User.updateMany({ _id: { $in: judgeIds } }, { $addToSet: { hackathonRoles: { hId: hackathon._id, role: 'judge' } } });
    }
    if (organizerIds.length > 0) {
      await User.updateMany({ _id: { $in: organizerIds } }, { $addToSet: { hackathonRoles: { hId: hackathon._id, role: 'organizer' } } });
    }

    log.success('CREATE_HACKATHON', `Hackathon created: "${hackathon.title}" with ${domains.length} domains`);
    emitCalendarUpdate('created', hackathon._id);

    res.status(201).json({ success: true, data: hackathon });
  } catch (err) {
    log.error('CREATE_HACKATHON', 'Failed to create', err);
    next({ statusCode: 400, message: err.message });
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
    
    // FIX: Updated populate path to 'organizers.userId'
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('judges.judgeUserId', 'fullName email')
      .populate('organizers.organizerUserId', 'fullName email');

    if (!hackathon) {
      log.warn('GET_HACKATHON', `Not found: ${req.params.id}`);
      return next({ statusCode: 404, message: 'Hackathon not found' });
    }

    log.success('GET_HACKATHON', `Found: "${hackathon.title}"`);
    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    log.error('GET_HACKATHON', 'Failed to fetch hackathon', err);
    next({ statusCode: 400, message: err.message });
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
export const updateHackathon = async (req, res, next) => {
  try {
    log.info('UPDATE_HACKATHON', 'Updating hackathon', { id: req.params.id, by: req.user?.email });

    // BUG FIX 1: Extract domains separately so we can parse the JSON string.
    // BUG FIX 2: Extract minTeamSize/maxTeamSize so we can add them back after validation.
    const {
      minTeamSize,
      maxTeamSize,
      judges: newJudgeIds,
      organizers: newOrganizerIds,
      domains: rawDomains,
      ...updateData
    } = req.body;

    // BUG FIX 2: Add team sizes back into the update payload after validation.
    if (minTeamSize !== undefined) updateData.minTeamSize = minTeamSize;
    if (maxTeamSize !== undefined) updateData.maxTeamSize = maxTeamSize;

    if (minTeamSize && maxTeamSize && Number(minTeamSize) > Number(maxTeamSize)) {
      return next({ statusCode: 400, message: "Minimum team size cannot be greater than maximum team size." });
    }

    if (req.file) updateData.image = req.file.path;

    // BUG FIX 1: Parse the domains JSON string (sent via FormData) into the
    // proper array of subdocuments that Mongoose expects.
    if (rawDomains !== undefined) {
      try {
        let parsedDomains = typeof rawDomains === 'string'
          ? JSON.parse(rawDomains)
          : rawDomains;

        if (!Array.isArray(parsedDomains)) {
          parsedDomains = [];
        }

        updateData.domains = parsedDomains.map((domain, index) => ({
          id: domain.id || (domain.name || '').toLowerCase().replace(/\s+/g, '-'),
          name: domain.name?.trim() || '',
          description: domain.description?.trim() || '',
          icon: domain.icon?.substring(0, 5) || '🏷️',
          order: domain.order || index + 1,
          createdAt: domain.createdAt || new Date(),
        }));

        log.info('UPDATE_HACKATHON', `Parsed ${updateData.domains.length} domains`);
      } catch (parseError) {
        log.warn('UPDATE_HACKATHON', 'Failed to parse domains — keeping existing', parseError);
        // Don't set updateData.domains — leave the existing domains in the DB untouched.
      }
    }

    // Parse incoming IDs and use standardized keys
    if (newJudgeIds) {
      const parsedJudges = Array.isArray(newJudgeIds) ? newJudgeIds : JSON.parse(newJudgeIds);
      if (parsedJudges.length > MAX_JUDGES) return next({ statusCode: 400, message: `Max ${MAX_JUDGES} judges allowed.` });
      updateData.judges = parsedJudges.map(id => ({ judgeUserId: id, assignedAt: new Date() }));
    }

    if (newOrganizerIds) {
      const parsedOrganizers = Array.isArray(newOrganizerIds) ? newOrganizerIds : JSON.parse(newOrganizerIds);
      updateData.organizers = parsedOrganizers.map(id => ({ organizerUserId: id, assignedAt: new Date() }));
    }

    const hackathon = await Hackathon.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!hackathon) return next({ statusCode: 404, message: 'Hackathon not found' });

    // Sync Roles
    const hId = hackathon._id;
    if (newJudgeIds) {
      const parsedJudges = Array.isArray(newJudgeIds) ? newJudgeIds : JSON.parse(newJudgeIds);
      await User.updateMany({ 'hackathonRoles.hId': hId, 'hackathonRoles.role': 'judge' }, { $pull: { hackathonRoles: { hId: hId, role: 'judge' } } });
      await User.updateMany({ _id: { $in: parsedJudges } }, { $addToSet: { hackathonRoles: { hId: hId, role: 'judge' } } });
    }

    if (newOrganizerIds) {
      const parsedOrganizers = Array.isArray(newOrganizerIds) ? newOrganizerIds : JSON.parse(newOrganizerIds);
      await User.updateMany({ 'hackathonRoles.hId': hId, 'hackathonRoles.role': 'organizer' }, { $pull: { hackathonRoles: { hId: hId, role: 'organizer' } } });
      await User.updateMany({ _id: { $in: parsedOrganizers } }, { $addToSet: { hackathonRoles: { hId: hId, role: 'organizer' } } });
    }

    log.success('UPDATE_HACKATHON', `Updated: "${hackathon.title}"`);
    emitCalendarUpdate('updated', hackathon._id);

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    log.error('UPDATE_HACKATHON', 'Failed to update', err);
    next({ statusCode: 400, message: err.message });
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
      .populate('leader', 'fullName email privacySettings skills')
      .populate('members.userId', 'fullName email privacySettings skills');

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

      // Aggregate team skills
      const skills = new Set();
      if (teamObj.members) {
        teamObj.members
          .filter((m) => m.status === "accepted")
          .forEach((m) => {
            if (m.userId?.skills) {
              m.userId.skills.forEach((s) => skills.add(s));
            }
          });
      }
      if (teamObj.leader?.skills) {
        teamObj.leader.skills.forEach((s) => skills.add(s));
      }
      teamObj.teamSkills = Array.from(skills);

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

/* ================= DOMAIN MANAGEMENT ================= */

export const addDomain = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const { id, name, description, icon, order } = req.body;
    log.info('ADD_DOMAIN', 'Adding domain', { hackathonId, domainId: id });

    if (!name || !id) {
      return next({
        statusCode: 400,
        message: 'Domain name and id are required',
      });
    }

    if (name.trim().length === 0) {
      return next({
        statusCode: 400,
        message: 'Domain name cannot be empty',
      });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      log.warn('ADD_DOMAIN', `Hackathon not found: ${hackathonId}`);
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    if (hackathon.domains.some((d) => d.id === id.toLowerCase())) {
      return next({
        statusCode: 400,
        message: 'Domain ID already exists in this hackathon',
      });
    }

    if (hackathon.domains.length >= 50) {
      return next({
        statusCode: 400,
        message: 'Maximum 50 domains allowed per hackathon',
      });
    }

    hackathon.domains.push({
      id: id.toLowerCase().replace(/\s+/g, '-'),
      name: name.trim(),
      description: description?.trim(),
      icon: icon?.substring(0, 5),
      order: order || hackathon.domains.length + 1,
      createdAt: new Date(),
    });

    await hackathon.save();

    log.success('ADD_DOMAIN', `Domain added: ${name}`);
    res.status(201).json({
      success: true,
      message: 'Domain added successfully',
      domains: hackathon.domains,
    });
  } catch (error) {
    log.error('ADD_DOMAIN', 'Failed to add domain', error);
    next({
      statusCode: 500,
      message: error.message,
    });
  }
};

export const removeDomain = async (req, res, next) => {
  try {
    const { hackathonId, domainId } = req.params;
    log.info('REMOVE_DOMAIN', 'Removing domain', { hackathonId, domainId });

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      log.warn('REMOVE_DOMAIN', `Hackathon not found: ${hackathonId}`);
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    const initialLength = hackathon.domains.length;
    hackathon.domains = hackathon.domains.filter(
      (d) => d.id !== domainId.toLowerCase()
    );

    if (hackathon.domains.length === initialLength) {
      log.warn('REMOVE_DOMAIN', `Domain not found: ${domainId}`);
      return next({
        statusCode: 404,
        message: 'Domain not found in this hackathon',
      });
    }

    await hackathon.save();

    log.success('REMOVE_DOMAIN', `Domain removed: ${domainId}`);
    res.status(200).json({
      success: true,
      message: 'Domain removed successfully',
      domains: hackathon.domains,
    });
  } catch (error) {
    log.error('REMOVE_DOMAIN', 'Failed to remove domain', error);
    next({
      statusCode: 500,
      message: error.message,
    });
  }
};

export const updateDomainOrder = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const { domains } = req.body;
    log.info('UPDATE_DOMAIN_ORDER', 'Updating domain order', { hackathonId });

    if (!Array.isArray(domains) || domains.length === 0) {
      return next({
        statusCode: 400,
        message: 'Domains array is required',
      });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      log.warn('UPDATE_DOMAIN_ORDER', `Hackathon not found: ${hackathonId}`);
      return next({
        statusCode: 404,
        message: 'Hackathon not found',
      });
    }

    hackathon.domains = domains;
    await hackathon.save();

    log.success('UPDATE_DOMAIN_ORDER', 'Domain order updated');
    res.status(200).json({
      success: true,
      message: 'Domain order updated successfully',
      domains: hackathon.domains,
    });
  } catch (error) {
    log.error('UPDATE_DOMAIN_ORDER', 'Failed to update domain order', error);
    next({
      statusCode: 500,
      message: error.message,
    });
  }
};

export const getDomainStats = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    log.info('GET_DOMAIN_STATS', 'Fetching domain statistics', { hackathonId });

    const stats = await Submission.aggregate([
      {
        $match: { hackathonId: new mongoose.Types.ObjectId(hackathonId) },
      },
      {
        $unwind: '$domains',
      },
      {
        $group: {
          _id: '$domains',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    log.success('GET_DOMAIN_STATS', `Retrieved stats for ${stats.length} domains`);
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    log.error('GET_DOMAIN_STATS', 'Failed to fetch domain stats', error);
    next({
      statusCode: 500,
      message: error.message,
    });
  }
};

export const getDomainTemplates = (req, res) => {
  try {
    log.info('GET_DOMAIN_TEMPLATES', 'Fetching domain templates');

    const templates = {
      tech: {
        label: 'Technology Track',
        domains: [
          { id: 'ai-ml', name: 'AI/ML', icon: '🤖' },
          { id: 'web-dev', name: 'Web Development', icon: '💻' },
          { id: 'mobile', name: 'Mobile Apps', icon: '📱' },
          { id: 'blockchain', name: 'Blockchain', icon: '⛓️' },
          { id: 'iot', name: 'IoT', icon: '🔧' },
          { id: 'ar-vr', name: 'AR/VR', icon: '🥽' },
        ],
      },
      social: {
        label: 'Impact Track',
        domains: [
          { id: 'healthcare', name: 'Healthcare', icon: '⚕️' },
          { id: 'education', name: 'Education', icon: '📚' },
          { id: 'environment', name: 'Environment', icon: '🌱' },
          { id: 'finance', name: 'FinTech', icon: '💰' },
          { id: 'social-good', name: 'Social Good', icon: '❤️' },
        ],
      },
      business: {
        label: 'Business Track',
        domains: [
          { id: 'productivity', name: 'Productivity', icon: '⚡' },
          { id: 'ecommerce', name: 'E-Commerce', icon: '🛒' },
          { id: 'logistics', name: 'Logistics', icon: '🚚' },
          { id: 'entertainment', name: 'Entertainment', icon: '🎮' },
        ],
      },
    };

    log.success('GET_DOMAIN_TEMPLATES', 'Domain templates retrieved');
    res.status(200).json({
      success: true,
      templates,
    });
  } catch (error) {
    log.error('GET_DOMAIN_TEMPLATES', 'Failed to fetch templates', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};