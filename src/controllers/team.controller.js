import Team from "../models/team.model.js";
import Hackathon from "../models/hackathon.model.js";
import User from "../models/user.model.js";
import log from "../utils/logger.js";
import { sendEmail } from "../utils/email.js";

/* ================= UPDATED CREATE TEAM ================= */
export const createTeam = async (req, res, next) => {
  try {
    const { name, hackathonId, members = [] } = req.body; 
    log.info('CREATE_TEAM', `User creating team`, { name, hackathonId, memberCount: members.length, by: req.user?.email });

    // 1. Verify Hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      log.warn('CREATE_TEAM', `Hackathon not found: ${hackathonId}`);
      return next({ statusCode: 404, message: 'Hackathon not found' });
    }

    if (hackathon.registrationDeadline && new Date() > new Date(hackathon.registrationDeadline)) {
      log.warn('CREATE_TEAM', `Registration deadline passed for hackathon: ${hackathonId}`);
      return next({ statusCode: 400, message: 'Registration deadline has passed.' });
    }

    if (req.user && (req.user.systemRole === 'admin' || req.user.systemRole === 'judge')) {
      log.warn('CREATE_TEAM', `Blocked: ${req.user.systemRole} trying to create team`);
      return next({ statusCode: 403, message: 'Admins and Judges cannot participate in hackathons.' });
    }

    // 2. CHECK FOR EXISTING TEAM (Prevention for 403 error)
    // Checks if current user is already a member or leader in ANY team for THIS hackathon
    const isAlreadyInTeam = await Team.findOne({
      hackathonId,
      "members.userId": req.user._id
    });

    if (isAlreadyInTeam) {
      log.warn('CREATE_TEAM', `Blocked: User ${req.user.email} is already in team "${isAlreadyInTeam.name}"`);
      return next({ 
        statusCode: 400, 
        message: "You are already a member of a team in this hackathon. Use the dashboard to manage your team." 
      });
    }

    const maxTeamSize = hackathon.maxTeamSize ?? 4;

    // 3. Prepare initial member list (Leader is automatically accepted)
    const initialMembers = [
      {
        userId: req.user._id,
        status: 'accepted',
        // role: 'leader' // Ensure your Team model supports 'role' inside members array
      }
    ];

    // Handle invites
    if (members.length > 0) {
      const uniqueInvites = [...new Set(members)].filter(
        id => id !== req.user._id.toString()
      );
      
      uniqueInvites.forEach(invitedUserId => {
        initialMembers.push({
          userId: invitedUserId,
          status: 'pending'
        });
      });
    }

    if (initialMembers.length > maxTeamSize) {
      log.warn('CREATE_TEAM', `Team size ${initialMembers.length} exceeds max ${maxTeamSize}`);
      return next({ statusCode: 400, message: `Max team size is ${maxTeamSize}` });
    }

    // 4. Create the Team
    const team = await Team.create({
      name,
      hackathonId,
      leader: req.user._id,
      maxSize: maxTeamSize,
      members: initialMembers,
      isOpenToJoin: true,
    });

    // 5. CRITICAL SYNC: Update User Document
    // We use $addToSet to ensure we don't create duplicate role entries
    // This ensures the "Register" button on SingleHackathon changes to "Registered"
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { 
        hackathonRoles: { 
          hackathonId: hackathonId, 
          role: "participant" 
        },
      }
    });

    // 6. SEND INVITE EMAILS
    if (members.length > 0) {
      const invitedUsers = await User.find({ _id: { $in: members } }).select('email fullName');
      invitedUsers.forEach(invitedUser => {
        sendEmail({
          to: invitedUser.email,
          subject: `You've been invited to join team "${name}"`,
          html: `
            <h1>Team Invitation</h1>
            <p>Hi ${invitedUser.fullName},</p>
            <p><strong>${req.user.fullName}</strong> has invited you to join their team <strong>"${name}"</strong> for the hackathon.</p>
            <p>Log in to your dashboard to accept the invitation.</p>
          `
        }).catch(err => log.error('EMAIL_ERROR', `Failed to send invite to ${invitedUser.email}`, err));
      });
    }

    log.success('CREATE_TEAM', `Team created and User role synced: "${name}" (id=${team._id})`);
    
    res.status(201).json({
      success: true,
      data: team,
    });

  } catch (err) {
    if (err.code === 11000) {
      log.warn('CREATE_TEAM', 'Duplicate team name in this hackathon');
      return next({
        statusCode: 400,
        message: "Team name already exists in this hackathon",
      });
    }
    log.error('CREATE_TEAM', 'Failed to create team', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ================= GET TEAM DETAILS ================= */
export const getTeamDetails = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    log.info('GET_TEAM', `Fetching team details`, { teamId, by: req.user?.email });

    const team = await Team.findById(teamId)
      .populate("leader", "fullName email")
      .populate("members.userId", "fullName email skills");

    if (!team) {
      log.warn('GET_TEAM', `Team not found: ${teamId}`);
      return next({
        statusCode: 404,
        message: "Team not found",
      });
    }

    log.success('GET_TEAM', `Returning team: "${team.name}"`);
    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (err) {
    log.error('GET_TEAM', 'Failed to fetch team', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ================= REQUEST JOIN TEAM ================= */
export const requestJoinTeam = async (req, res, next) => {
  try {
    log.info('JOIN_TEAM', `Join request`, { teamId: req.params.teamId, by: req.user?.email });
    const { message } = req.body;
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      log.warn('JOIN_TEAM', `Team not found: ${req.params.teamId}`);
      return next({
        statusCode: 404,
        message: "Team not found",
      });
    }

    const userExists = team.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (userExists) {
      log.warn('JOIN_TEAM', `User already in team: ${req.user.email}`);
      return next({
        statusCode: 400,
        message: "User already in team or has pending request",
      });
    }

    if (!team.isOpenToJoin) {
      log.warn('JOIN_TEAM', `Team not open to join: ${team.name}`);
      return next({
        statusCode: 400,
        message: "Team is not accepting join requests",
      });
    }

    const acceptedMembers = team.members.filter((m) => m.status === "accepted");
    if (acceptedMembers.length >= team.maxSize) {
      log.warn('JOIN_TEAM', `Team full: ${acceptedMembers.length}/${team.maxSize}`);
      return next({
        statusCode: 400,
        message: "Team is full",
      });
    }

    team.members.push({
      userId: req.user._id,
      status: "pending",
      message: message || ""
    });

    await team.save();
    
    // Sync User Role (Register User for Hackathon if not already)
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { 
        hackathonRoles: { 
          hackathonId: team.hackathonId, 
          role: "participant" 
        } 
      }
    });

    // Notify Leader
    const leader = await User.findById(team.leader).select('email fullName');
    if (leader) {
      sendEmail({
        to: leader.email,
        subject: `New join request for your team "${team.name}"`,
        html: `
          <h1>Join Request</h1>
          <p>Hi ${leader.fullName},</p>
          <p><strong>${req.user.fullName}</strong> has requested to join your team <strong>"${team.name}"</strong>.</p>
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          <p>Log in to your team headquarters to review the request.</p>
        `
      }).catch(err => log.error('EMAIL_ERROR', `Failed to notify leader ${leader.email}`, err));
    }

    log.success('JOIN_TEAM', `Join request sent to "${team.name}" by ${req.user.email}`);
    res.status(200).json({
      success: true,
      message: "Join request sent",
    });
  } catch (err) {
    log.error('JOIN_TEAM', 'Join request failed', err);
    next({ statusCode: 400, message: err.message });
  }
};

/* ================= ACCEPT / REJECT MEMBER ================= */
export const manageTeamMember = async (req, res, next) => {
  try {
    const { memberId, status } = req.body;
    log.info('MANAGE_MEMBER', `Managing member`, { teamId: req.params.teamId, memberId, status, by: req.user?.email });

    const team = await Team.findById(req.params.teamId);
    if (!team) {
      log.warn('MANAGE_MEMBER', `Team not found: ${req.params.teamId}`);
      return next({ statusCode: 404, message: "Team not found" });
    }

    const member = team.members.find(
      m => m.userId.toString() === memberId
    );
    if (!member) {
      log.warn('MANAGE_MEMBER', `Member not found in team: ${memberId}`);
      return next({ statusCode: 404, message: "Member not found" });
    }

    if (status === "accepted") {
      const accepted = team.members.filter(m => m.status === "accepted");
      if (accepted.length >= team.maxSize) {
        log.warn('MANAGE_MEMBER', `Team full, cannot accept: ${accepted.length}/${team.maxSize}`);
        return next({ statusCode: 400, message: "Team is full" });
      }
    }

    if (status === "accepted") {
      member.status = status;
    } else if (status === "rejected") {
      // Remove entirely if rejected/kicked
      team.members = team.members.filter(m => m.userId.toString() !== memberId);
    }
    
    await team.save();

    // AUTO-WITHDRAW other requests if accepted
    if (status === "accepted") {
      log.info('MANAGE_MEMBER', `Auto-withdrawing other requests for user: ${memberId}`);
      await Team.updateMany(
        { 
          hackathonId: team.hackathonId, 
          _id: { $ne: team._id },
          "members.userId": memberId,
          "members.status": "pending"
        },
        {
          $pull: { members: { userId: memberId } }
        }
      );
    }

    log.info('MANAGE_MEMBER', `Member status updated to "${status}"`);

    const user = await User.findById(memberId);
    if (!user) {
      log.warn('MANAGE_MEMBER', `User not found: ${memberId}`);
      return next({ statusCode: 404, message: "User not found" });
    }

    if (status === "accepted") {
      const exists = user.hackathonRoles.some(
        r =>
          r.hackathonId.equals(team.hackathonId) &&
          r.role === "participant"
      );

      if (!exists) {
        user.hackathonRoles.push({
          hackathonId: team.hackathonId,
          role: "participant"
        });
        log.info('MANAGE_MEMBER', `Added participant role for user: ${user.email}`);
      }
    } else {
      const stillInTeam = await Team.exists({
        hackathonId: team.hackathonId,
        "members.userId": user._id,
        "members.status": "accepted"
      });

      if (!stillInTeam) {
        user.hackathonRoles = user.hackathonRoles.filter(
          r =>
            !(r.hackathonId.equals(team.hackathonId) &&
              r.role === "participant")
        );
        log.info('MANAGE_MEMBER', `Removed participant role for user: ${user.email}`);
      }
    }

    await user.save();

    // Notify User
    sendEmail({
      to: user.email,
      subject: `Your membership for team "${team.name}" was ${status}`,
      html: `
        <h1>Team Status Update</h1>
        <p>Hi ${user.fullName},</p>
        <p>Your request to join team <strong>"${team.name}"</strong> has been <strong>${status}</strong> by the team leader.</p>
        ${status === 'accepted' ? '<p>You can now access the project submission portal.</p>' : '<p>You can now join or create another team.</p>'}
      `
    }).catch(err => log.error('EMAIL_ERROR', `Failed to notify user ${user.email}`, err));

    log.success('MANAGE_MEMBER', `Member ${status}: ${user.email}`);
    res.status(200).json({
      success: true,
      message: `Member ${status}`
    });

  } catch (err) {
    log.error('MANAGE_MEMBER', 'Failed to manage member', err);
    next({ statusCode: 500, message: err.message });
  }
};

//* ================= SEARCH TEAMS ================= */
export const searchTeams = async (req, res, next) => {
  try {
    const { q } = req.query;
    const { hackathonId } = req.params;
    log.info('SEARCH_TEAMS', `Searching teams`, { hackathonId, query: q, by: req.user?.email });

    if (!q) {
      return next({ statusCode: 400, message: "Search query required" });
    }

    const teams = await Team.find({
      hackathonId,
      name: { $regex: q, $options: "i" }
    })
      .select("name leader members maxSize isOpenToJoin")
      .populate("leader", "fullName email");

    log.success('SEARCH_TEAMS', `Found ${teams.length} teams for query="${q}"`);
    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });

  } catch (err) {
    log.error('SEARCH_TEAMS', 'Search failed', err);
    next({ statusCode: 500, message: err.message });
  }
};



export const publicTeamSearch = async (req, res, next) => {
  try {
    log.info('PUBLIC_TEAM_SEARCH', `Public team search`, { hackathonId: req.params.hackathonId, query: req.query.q });
    const teams = await Team.find({
      hackathonId: req.params.hackathonId,
      name: { $regex: req.query.q, $options: 'i' },
      isOpenToJoin: true
    }).select("name maxSize members");

    log.success('PUBLIC_TEAM_SEARCH', `Found ${teams.length} open teams`);
    res.json({ success: true, data: teams });
  } catch (err) {
    log.error('PUBLIC_TEAM_SEARCH', 'Search failed', err);
    next({ statusCode: 500, message: err.message });
  }
};

// ================= GET PENDING JOIN REQUESTS ================= */
export const getPendingJoinRequests = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    log.info('PENDING_REQUESTS', `Fetching pending requests`, { teamId, by: req.user?.email });

    const team = await Team.findById(teamId).populate(
      "members.userId",
      "fullName email"
    );

    if (!team) {
      log.warn('PENDING_REQUESTS', `Team not found: ${teamId}`);
      return next({
        statusCode: 404,
        message: "Team not found",
      });
    }

    const pendingMembers = team.members.filter(
      (member) => member.status === "pending"
    );

    log.success('PENDING_REQUESTS', `Found ${pendingMembers.length} pending requests`);
    res.status(200).json({
      success: true,
      count: pendingMembers.length,
      data: pendingMembers,
    });
  } catch (err) {
    log.error('PENDING_REQUESTS', 'Failed to fetch pending requests', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ================= UPDATE TEAM ================= */
export const updateTeam = async (req, res, next) => {
  try {
    log.info('UPDATE_TEAM', `Updating team`, { teamId: req.params.teamId, fields: Object.keys(req.body), by: req.user?.email });
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.teamId,
      req.body,
      { new: true }
    );

    log.success('UPDATE_TEAM', `Team updated: "${updatedTeam?.name}"`);
    res.status(200).json({
      success: true,
      data: updatedTeam,
    });
  } catch (err) {
    log.error('UPDATE_TEAM', 'Failed to update team', err);
    next({ statusCode: 400, message: err.message });
  }
};

/* ================= LEAVE TEAM ================= */
export const leaveTeam = async (req, res, next) => {
  try {
    log.info('LEAVE_TEAM', `User leaving team`, { teamId: req.params.teamId, by: req.user?.email });
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      log.warn('LEAVE_TEAM', `Team not found: ${req.params.teamId}`);
      return next({ statusCode: 404, message: "Team not found" });
    }

    team.members = team.members.filter(
      (m) => m.userId.toString() !== req.user._id.toString()
    );

    await team.save();

    // CRITICAL SYNC: Remove participant role from the user
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { 
        hackathonRoles: { 
          hackathonId: team.hackathonId, 
          role: "participant" 
        } 
      }
    });

    log.success('LEAVE_TEAM', `User left team: "${team.name}"`);
    res.status(200).json({
      success: true,
      message: "Left team successfully",
    });
  } catch (err) {
    log.error('LEAVE_TEAM', 'Failed to leave team', err);
    next({ statusCode: 400, message: err.message });
  }
};

//* ================= DELETE TEAM ================= */
export const deleteTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    log.info('DELETE_TEAM', `Deleting team`, { teamId, by: req.user?.email });

    const team = await Team.findByIdAndDelete(teamId);

    if (!team) {
      log.warn('DELETE_TEAM', `Team not found: ${teamId}`);
      return next({
        statusCode: 404,
        message: "Team not found",
      });
    }

    // CRITICAL SYNC: Remove participant role from ALL members
    const memberIds = team.members.map(m => m.userId);
    await User.updateMany(
      { _id: { $in: memberIds } },
      {
        $pull: { 
          hackathonRoles: { 
            hackathonId: team.hackathonId, 
            role: "participant" 
          } 
        }
      }
    );

    log.success('DELETE_TEAM', `Team deleted: "${team.name}"`);
    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (err) {
    log.error('DELETE_TEAM', 'Failed to delete team', err);
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};

/* ================= WITHDRAW JOIN REQUEST ================= */
export const withdrawJoinRequest = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    log.info('WITHDRAW_REQUEST', `Withdrawing request`, { teamId, by: req.user?.email });

    const team = await Team.findById(teamId);
    if (!team) {
      log.warn('WITHDRAW_REQUEST', `Team not found: ${teamId}`);
      return next({ statusCode: 404, message: "Team not found" });
    }

    const memberIndex = team.members.findIndex(
      m => m.userId.toString() === req.user._id.toString() && m.status === "pending"
    );

    if (memberIndex === -1) {
      log.warn('WITHDRAW_REQUEST', `No pending request found for user in team: ${teamId}`);
      return next({ statusCode: 404, message: "No pending request found" });
    }

    team.members.splice(memberIndex, 1);
    await team.save();

    // Check if user has any other membership in this hackathon (pending or accepted)
    const otherMembership = await Team.exists({
      hackathonId: team.hackathonId,
      "members.userId": req.user._id
    });

    if (!otherMembership) {
      log.info('WITHDRAW_REQUEST', `No other memberships found, pulling participant role for ${req.user.email}`);
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { 
          hackathonRoles: { 
            hackathonId: team.hackathonId, 
            role: "participant" 
          } 
        }
      });
    }

    log.success('WITHDRAW_REQUEST', `Request withdrawn from team: "${team.name}"`);
    res.status(200).json({
      success: true,
      message: "Request withdrawn successfully",
    });
  } catch (err) {
    log.error('WITHDRAW_REQUEST', 'Failed to withdraw request', err);
    next({ statusCode: 500, message: err.message });
  }
};

/* ================= DISCOVER MEMBERS ================= */
export const discoverMembers = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    
    if (!team) {
      return next({ statusCode: 404, message: "Team not found" });
    }

    // Find all users who are already in an accepted team for this hackathon
    const teamsInHackathon = await Team.find({ hackathonId: team.hackathonId });
    const unavailableUserIds = new Set();
    
    teamsInHackathon.forEach(t => {
      t.members.forEach(m => {
        if (m.status === 'accepted') {
          unavailableUserIds.add(m.userId.toString());
        }
        // Also exclude users who already have a pending/invited status for the current team
        if (t._id.toString() === teamId && (m.status === 'pending' || m.status === 'invited')) {
          unavailableUserIds.add(m.userId.toString());
        }
      });
      // Exclude leaders too
      unavailableUserIds.add(t.leader.toString());
    });

    const availableUsers = await User.find({
      systemRole: 'user',
      _id: { $nin: Array.from(unavailableUserIds) }
    }).select('fullName email skills college major year degree _id');

    res.status(200).json({
      success: true,
      data: availableUsers
    });

  } catch (err) {
    log.error('DISCOVER_MEMBERS', 'Failed to fetch discoverable members', err);
    next({ statusCode: 500, message: err.message });
  }
};

/* ================= INVITE MEMBER ================= */
export const inviteMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;
    const team = await Team.findById(teamId);

    if (!team) {
      return next({ statusCode: 404, message: "Team not found" });
    }

    // Check team size
    const acceptedCount = team.members.filter(m => m.status === 'accepted').length;
    const maxSize = team.maxSize || 4; // default to 4 if not set
    if (acceptedCount >= maxSize) {
      return next({ statusCode: 400, message: "Team is already full" });
    }

    // Check if user is already invited or pending
    const existingMember = team.members.find(m => m.userId.toString() === userId);
    if (existingMember) {
      return next({ statusCode: 400, message: "User is already invited or requested to join" });
    }

    // Add invitation
    team.members.push({ userId, status: 'invited' });
    await team.save();

    res.status(200).json({ success: true, message: "Invitation sent successfully" });

  } catch (err) {
    log.error('INVITE_MEMBER', 'Failed to invite member', err);
    next({ statusCode: 500, message: err.message });
  }
};

/* ================= RESPOND TO INVITE ================= */
export const respondToInvite = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const team = await Team.findById(teamId);

    if (!team) return next({ statusCode: 404, message: "Team not found" });

    const memberIndex = team.members.findIndex(m => m.userId.toString() === req.user._id.toString() && m.status === 'invited');
    if (memberIndex === -1) {
      return next({ statusCode: 404, message: "No invitation found" });
    }

    if (action === 'accept') {
      const acceptedCount = team.members.filter(m => m.status === 'accepted').length;
      const maxSize = team.maxSize || 4;
      if (acceptedCount >= maxSize) {
        return next({ statusCode: 400, message: "Team is already full" });
      }

      // Check if user is already accepted in another team for this hackathon
      const isAlreadyInTeam = await Team.findOne({
        hackathonId: team.hackathonId,
        $or: [
          { leader: req.user._id },
          { members: { $elemMatch: { userId: req.user._id, status: 'accepted' } } }
        ]
      });

      if (isAlreadyInTeam) {
        return next({ statusCode: 400, message: "You are already in a team for this hackathon" });
      }

      team.members[memberIndex].status = 'accepted';
      await team.save();

      // AUTO-WITHDRAW other requests/invitations in the same hackathon
      const otherTeams = await Team.find({
        hackathonId: team.hackathonId,
        _id: { $ne: team._id },
        'members.userId': req.user._id
      });

      for (const otherTeam of otherTeams) {
        otherTeam.members = otherTeam.members.filter(m => m.userId.toString() !== req.user._id.toString());
        await otherTeam.save();
      }

      // SYNC ROLE
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { 
          hackathonRoles: { 
            hackathonId: team.hackathonId, 
            role: "participant" 
          }
        }
      });

      res.status(200).json({ success: true, message: "Invitation accepted" });
    } else if (action === 'decline') {
      // Remove the member entry
      team.members.splice(memberIndex, 1);
      await team.save();
      res.status(200).json({ success: true, message: "Invitation declined" });
    } else {
      return next({ statusCode: 400, message: "Invalid action" });
    }

  } catch (err) {
    log.error('RESPOND_INVITE', 'Failed to respond to invite', err);
    next({ statusCode: 500, message: err.message });
  }
};
