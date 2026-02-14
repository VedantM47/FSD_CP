import Team from "../models/team.model.js";
import Hackathon from "../models/hackathon.model.js";

/* ================= UPDATED CREATE TEAM ================= */
export const createTeam = async (req, res, next) => {
  try {
    // 1. Get 'members' array from body (List of User IDs)
    const { name, hackathonId, members = [] } = req.body; 
    
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return next({ statusCode: 404, message: 'Hackathon not found' });

    const maxTeamSize = hackathon.maxTeamSize ?? 4;

    // 2. Prepare the Member List
    // Leader is 'accepted' automatically.
    const initialMembers = [
      {
        userId: req.user._id,
        status: 'accepted',
        role: 'leader' 
      }
    ];

    // 3. Add Invited Members as 'pending'
    if (members.length > 0) {
      // Filter out duplicates and self-invite
      const uniqueInvites = [...new Set(members)].filter(
        id => id !== req.user._id.toString()
      );
      
      uniqueInvites.forEach(invitedUserId => {
        initialMembers.push({
          userId: invitedUserId,
          status: 'pending' // <--- Key: They must accept later
        });
      });
    }

    // 4. Check Size Limit
    if (initialMembers.length > maxTeamSize) {
      return next({ statusCode: 400, message: `Max team size is ${maxTeamSize}` });
    }

    // 5. Create Team
    const team = await Team.create({
      name,
      hackathonId,
      leader: req.user._id,
      maxSize: maxTeamSize,
      members: initialMembers, // <--- Saving the list!
      isOpenToJoin: true,
    });

    req.user.hackathonRoles.push({
      hackathonId,
      role: "participant",
    });
    await req.user.save();
    res.status(201).json({
      success: true,
      data: team,
    });
  } catch (err) {
    if (err.code === 11000) {
      return next({
        statusCode: 400,
        message: "Team name already exists in this hackathon",
      });
    }
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

    const team = await Team.findById(teamId)
      .populate("leader", "fullName email")
      .populate("members.userId", "fullName email");

    if (!team) {
      return next({
        statusCode: 404,
        message: "Team not found",
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

    if (!team) {
      return next({
        statusCode: 404,
        message: "Team not found",
      });
    }

    //  Check if user already in team
    const userExists = team.members.some(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (userExists) {
      return next({
        statusCode: 400,
        message: "User already in team or has pending request",
      });
    }

    //  Check if team is open to join
    if (!team.isOpenToJoin) {
      return next({
        statusCode: 400,
        message: "Team is not accepting join requests",
      });
    }

    //  Check if team is full (only accepted members count)
    const acceptedMembers = team.members.filter((m) => m.status === "accepted");
    if (acceptedMembers.length >= team.maxSize) {
      return next({
        statusCode: 400,
        message: "Team is full",
      });
    }

    team.members.push({
      userId: req.user._id,
      status: "pending",
    });

    await team.save();

    res.status(200).json({
      success: true,
      message: "Join request sent",
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
    if (!team) {
      return next({ statusCode: 404, message: "Team not found" });
    }

    const member = team.members.find(
      m => m.userId.toString() === memberId
    );
    if (!member) {
      return next({ statusCode: 404, message: "Member not found" });
    }

    // Prevent accepting if team is full
    if (status === "accepted") {
      const accepted = team.members.filter(m => m.status === "accepted");
      if (accepted.length >= team.maxSize) {
        return next({ statusCode: 400, message: "Team is full" });
      }
    }

    member.status = status;
    await team.save();

    const user = await User.findById(memberId);
    if (!user) return next({ statusCode: 404, message: "User not found" });

    if (status === "accepted") {
      // Add participant role
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
      }
    } else {
      // Remove participant role if rejected and no other teams
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
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Member ${status}`
    });

  } catch (err) {
    next({ statusCode: 500, message: err.message });
  }
};

//* ================= SEARCH TEAMS ================= */
export const searchTeams = async (req, res, next) => {
  try {
    const { q } = req.query;
    const { hackathonId } = req.params;

    if (!q) {
      return next({ statusCode: 400, message: "Search query required" });
    }

    const teams = await Team.find({
      hackathonId,
      name: { $regex: q, $options: "i" }
    })
      .select("name leader members maxSize isOpenToJoin")
      .populate("leader", "fullName email");

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });

  } catch (err) {
    next({ statusCode: 500, message: err.message });
  }
};



export const publicTeamSearch = async (req, res) => {
  const teams = await Team.find({
    hackathonId: req.params.hackathonId,
    name: { $regex: req.query.q, $options: 'i' },
    isOpenToJoin: true
  }).select("name maxSize members");

  res.json({ success: true, data: teams });
};

// ================= GET PENDING JOIN REQUESTS ================= */
export const getPendingJoinRequests = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId).populate(
      "members.userId",
      "fullName email"
    );

    if (!team) {
      return next({
        statusCode: 404,
        message: "Team not found",
      });
    }

    const pendingMembers = team.members.filter(
      (member) => member.status === "pending"
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
      message: "Left team successfully",
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
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (err) {
    next({
      statusCode: 500,
      message: err.message,
    });
  }
};
