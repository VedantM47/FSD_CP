
const policy = {

  // =====================================================
  // USER POLICIES
  // =====================================================

  // User can access (view/update) own profile
  USER_SELF_ACCESS: ({ user, targetUserId }) => {
    if (!user || !targetUserId) return false;
    return user._id.equals(targetUserId);
  },

  // Judge or Admin can view all users
  VIEW_USERS: ({ user }) => {
    if (!user) return false;

    if (user.systemRole === 'admin') return true;

    return user.hackathonRoles?.some(
      (r) => r.role === 'judge'
    );
  },

  // Only system admin has full access
  ADMIN_ALL: ({ user }) => {
    if (!user) return false;
    return user.systemRole === 'admin';
  },

  /* =====================================================
     TEAM POLICIES
     ===================================================== */

  // Create a team
  CREATE_TEAM: ({ user, hackathon, existingTeam }) => {
    if (!user || !hackathon) return false;

    // Hackathon must be open
    if (hackathon.status !== 'open') return false;

    // Judges cannot create teams
    const isJudge = user.hackathonRoles?.some(
      (r) =>
        r.hackathonId.equals(hackathon._id) &&
        r.role === 'judge'
    );
    if (isJudge) return false;

    // User must not already be in a team for this hackathon
    if (existingTeam) return false;

    return true;
  },

  // Update team details (leader only)
  UPDATE_TEAM: ({ user, team }) => {
    if (!user || !team) return false;

    if (team.isLocked) return false;

    return team.leader.equals(user._id);
  },

  // Request to join an open team
  REQUEST_JOIN_TEAM: ({ user, team, hackathon, isAlreadyInTeam }) => {
    if (!user || !team || !hackathon) return false;

    if (hackathon.status !== 'open') return false;
    if (!team.isOpenToJoin) return false;
    if (team.isLocked) return false;

    // Team size check
    const acceptedMembers = team.members.filter(
      (m) => m.status === 'accepted'
    );
    if (acceptedMembers.length >= team.maxSize) return false;

    // User must not already be in a team for this hackathon
    if (isAlreadyInTeam) return false;

    return true;
  },

  // Accept / Reject team join requests (leader only)
  MANAGE_TEAM_MEMBERS: ({ user, team }) => {
    if (!user || !team) return false;

    if (team.isLocked) return false;

    return team.leader.equals(user._id);
  },

  // View team details
  VIEW_TEAM: ({ user, team }) => {
    if (!user || !team) return false;

    if (team.leader.equals(user._id)) return true;

    return team.members.some(
      (m) =>
        m.userId.equals(user._id) &&
        m.status === 'accepted'
    );
  },

  // Leave team (members only, not leader)
  LEAVE_TEAM: ({ user, team }) => {
    if (!user || !team) return false;

    if (team.isLocked) return false;

    if (team.leader.equals(user._id)) return false;

    return team.members.some(
      (m) =>
        m.userId.equals(user._id) &&
        m.status === 'accepted'
    );
  },

  // Submit project (leader only, during ongoing hackathon)
  SUBMIT_PROJECT: ({ user, team, hackathon }) => {
    if (!user || !team || !hackathon) return false;

    if (!team.leader.equals(user._id)) return false;

    if (hackathon.status !== 'ongoing') return false;

    return true;
  },
};

module.exports = policy;