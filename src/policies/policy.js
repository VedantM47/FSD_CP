
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

    // Admin can view all users
  VIEW_ALL_USERS: ({ user }) => {
    return user?.systemRole === 'admin';
  },

    // Admin can view any user
  VIEW_USER_BY_ID: ({ user }) => {
    if (!user) return false;
    return user.systemRole === 'admin';
  },

  // Admin can delete user
  DELETE_USER: ({ user }) => {
    if (!user) return false;
    return user.systemRole === 'admin';
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

  VIEW_TEAM_DETAILS: ({ user, team, hackathon }) => {
  if (!user || !team) return false;

  // Admin can always view
  if (user.systemRole === 'admin') return true;

  // Leader
  if (team.leader.equals(user._id)) return true;

  // Accepted team member
  const isMember = team.members.some(
    (m) =>
      m.userId.equals(user._id) &&
      m.status === 'accepted'
  );
  if (isMember) return true;

  // Organizer of this hackathon
  const isOrganizer = user.hackathonRoles?.some(
    (r) =>
      r.hackathonId.equals(hackathon?._id) &&
      r.role === 'organizer'
  );

  return Boolean(isOrganizer);
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

  // Delete team (leader only)
  DELETE_TEAM: ({ user, team }) => {
  if (!user || !team) return false;
  if (team.isLocked) return false;
  return team.leader.equals(user._id);
  },

  // Submit project (leader only, during ongoing hackathon)
  SUBMIT_PROJECT: ({ user, team, hackathon }) => {
    if (!user || !team || !hackathon) return false;

    if (!team.leader.equals(user._id)) return false;

    if (hackathon.status !== 'ongoing') return false;

    return true;
  },

  /* =====================================================
   HACKATHON POLICIES
   ===================================================== */

  // Create hackathon
  CREATE_HACKATHON: ({ user }) => {
    if (!user) return false;

    return (
      user.systemRole === 'admin' ||
      user.systemRole === 'faculty'
    );
  },

  // Update hackathon
  UPDATE_HACKATHON: ({ user, hackathon }) => {
    if (!user || !hackathon) return false;

    // Admin always allowed
    if (user.systemRole === 'admin') return true;

    // Faculty allowed
    if (user.systemRole === 'faculty') return true;

    // Organizer of this hackathon
    const isOrganizer = user.hackathonRoles?.some(
      (r) =>
        r.hackathonId.equals(hackathon._id) &&
        r.role === 'organizer'
    );

    return Boolean(isOrganizer);
  },

  // Delete hackathon
  DELETE_HACKATHON: ({ user, hackathon }) => {
    if (!user || !hackathon) return false;

    // Admin only for delete (recommended)
    if (user.systemRole === 'admin') return true;

    // Optional: allow faculty
    if (user.systemRole === 'faculty') return true;

    return false;
  },
};



export default policy;