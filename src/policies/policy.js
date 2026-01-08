
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
      user.systemRole === 'mentor'
    );
  },

  // Update hackathon
  UPDATE_HACKATHON: ({ user, hackathon }) => {
    if (!user || !hackathon) return false;

    // Admin always allowed
    if (user.systemRole === 'admin') return true;

    // mentor allowed
    if (user.systemRole === 'mentor') return true;

    // Organizer of this hackathon
    const isOrganizer = user.hackathonRoles?.some(
      (r) =>
        r.hackathonId.equals(hackathon._id) &&
        r.role === 'organizer'
    );

    return Boolean(isOrganizer);
  },

  // Assign judge to hackathon
  ASSIGN_JUDGE: ({ user, hackathon }) => {
  if (!user || !hackathon) return false;

  // Admin always allowed
  if (user.systemRole === 'admin') return true;

  // Mentor allowed
  if (user.systemRole === 'Mentor') return true;

  // Organizer of this hackathon allowed
  const isOrganizer = user.hackathonRoles?.some(
    (r) =>
      r.hackathonId.equals(hackathon._id) &&
      r.role === 'organizer'
  );

  return Boolean(isOrganizer);
},

// Remove judge from hackathon
REMOVE_JUDGE: ({ user, hackathon }) => {
  if (!user || !hackathon) return false;

  // Admin
  if (user.systemRole === 'admin') return true;

  // mentor / Mentor
  if (user.systemRole === 'mentor') return true;

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

    // Optional: allow mentor
    if (user.systemRole === 'mentor') return true;

    return false;
  },
  /* =====================================================
     SUBMISSION POLICIES
     ===================================================== */

  // Create a new submission
  // Context needed: { user, team, hackathon, existingSubmission }
  CREATE_SUBMISSION: ({ user, team, hackathon, existingSubmission }) => {
    if (!user || !team || !hackathon) return false;

    // 1. Only Team Leader can submit
    if (!team.leader.equals(user._id)) return false;

    // 2. Team must be registered for THIS hackathon
    // (Assuming hackathonId is an ObjectId)
    if (!team.hackathonId.equals(hackathon._id)) return false;

    // 3. Hackathon must be 'ongoing'
    // You cannot submit if the hackathon is 'closed' or just 'open' for registration
    if (hackathon.status !== 'ongoing') return false;

    // 4. Deadline Check (Strict)
    // If current time > endDate, submission is blocked
    if (new Date() > new Date(hackathon.endDate)) return false;

    // 5. Prevent Duplicates
    // If we passed an existing submission in context, deny creating a new one
    if (existingSubmission) return false;

    return true;
  },

  // Update an existing submission (e.g., fix a link)
  // Context needed: { user, team, hackathon, submission }
  UPDATE_SUBMISSION: ({ user, team, hackathon, submission }) => {
    if (!user || !team || !hackathon || !submission) return false;

    // 1. Only Team Leader can edit
    if (!team.leader.equals(user._id)) return false;

    // 2. Submission must belong to this team
    if (!submission.teamId.equals(team._id)) return false;

    // 3. Hackathon must still be ongoing (cannot edit after deadline)
    if (hackathon.status !== 'ongoing') return false;
    if (new Date() > new Date(hackathon.endDate)) return false;

    return true;
  },

  // View a submission (PPT/Repo links)
  // Context needed: { user, team, submission }
  VIEW_SUBMISSION: ({ user, team, submission }) => {
    if (!user || !submission) return false;

    // 1. Admin always allowed
    if (user.systemRole === 'admin') return true;

    // 2. TEAM MEMBERS & LEADER
    // If the user is in the team (leader or accepted member), they can view.
    if (team) {
      // Is Leader?
      if (team.leader.equals(user._id)) return true;
      
      // Is Accepted Member?
      const isMember = team.members.some(
        (m) => m.userId.equals(user._id) && m.status === 'accepted'
      );
      if (isMember) return true;
    }

    // 3. JUDGES assigned to THIS specific Hackathon
    // We check the user's 'hackathonRoles' array
    const isJudge = user.hackathonRoles?.some(
      (r) => 
        r.hackathonId.equals(submission.hackathonId) && 
        r.role === 'judge'
    );
    
    return Boolean(isJudge);
  },

  /* ================= EVALUATION POLICIES ================= */

  // Judge can evaluate team in hackathon
  CREATE_EVALUATION: ({ user, hackathon, team }) => {
    if (!user || !hackathon || !team) return false;

    // Admin override
    if (user.systemRole === 'admin') return true;

    // Judge assigned to this hackathon
    const isJudge = hackathon.judges?.some(
      (j) => j.judgeUserId.toString() === user._id.toString()
    );

    return Boolean(isJudge);
  },

  // Judge can update own evaluation (if not locked)
  UPDATE_EVALUATION: ({ user, evaluation }) => {
    if (!user || !evaluation) return false;

    if (evaluation.status === 'locked') return false;

    // Admin override
    if (user.systemRole === 'admin') return true;

    return evaluation.judgeId.equals(user._id);
  },

  // Admin / mentor can lock evaluation
  LOCK_EVALUATION: ({ user }) => {
    if (!user) return false;
    return user.systemRole === 'admin' || user.systemRole === 'mentor';
  },

  // View evaluation (restricted)
  VIEW_EVALUATION: ({ user, hackathon, team }) => {
    if (!user || !hackathon || !team) return false;

    // Admin
    if (user.systemRole === 'admin') return true;

    // Judge of this hackathon
    const isJudge = hackathon.judges?.some(
      (j) => j.judgeUserId.toString() === user._id.toString()
    );
    if (isJudge) return true;

    // Team leader or accepted member
    if (team.leader.equals(user._id)) return true;

    const isMember = team.members?.some(
      (m) =>
        m.userId.equals(user._id) &&
        m.status === 'accepted'
    );

    return Boolean(isMember);
  },

  // Admin / mentor can delete evaluation
  DELETE_EVALUATION: ({ user }) => {
    if (!user) return false;
    return user.systemRole === 'admin' || user.systemRole === 'mentor';
  },
 
};
  


export default policy;