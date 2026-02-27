const policy = {

/* =====================================================
   USER POLICIES
===================================================== */

USER_SELF_ACCESS: ({ user, targetUserId }) => {
  return Boolean(user && targetUserId && user._id.equals(targetUserId));
},

VIEW_ALL_USERS: ({ user }) => user?.systemRole === 'admin',

VIEW_USER_BY_ID: ({ user }) => user?.systemRole === 'admin',

DELETE_USER: ({ user }) => user?.systemRole === 'admin',

SEARCH_USERS: ({ user }) => Boolean(user),

/* =====================================================
   TEAM POLICIES
===================================================== */

/* 🔥 Team creation creates participation → no participant required */
CREATE_TEAM: ({ user, hackathon, existingTeam }) => {
  if (!user || !hackathon) return false;
  if (hackathon.status !== 'open') return false;
  if (existingTeam) return false;

  // Judges cannot create teams
  const isJudge = user.hackathonRoles?.some(
    r => r.hackathonId.equals(hackathon._id) && r.role === 'judge'
  );
  if (isJudge) return false;

  return true;
},

REQUEST_JOIN_TEAM: ({ user, team, hackathon, isAlreadyInTeam }) => {
  if (!user || !team || !hackathon) return false;

  if (hackathon.status !== 'open') return false;
  if (!team.isOpenToJoin || team.isLocked) return false;
  if (isAlreadyInTeam) return false;

  const accepted = team.members.filter(m => m.status === 'accepted');
  if (accepted.length >= team.maxSize) return false;

  return true; // ❗ Do NOT require participant
},

MANAGE_TEAM_MEMBERS: ({ user, team }) => {
  return Boolean(user && team && !team.isLocked && team.leader.equals(user._id));
},

UPDATE_TEAM: ({ user, team }) => {
  return Boolean(user && team && !team.isLocked && team.leader.equals(user._id));
},

LEAVE_TEAM: ({ user, team }) => {
  if (!user || !team || team.isLocked) return false;
  if (team.leader.equals(user._id)) return false;

  return team.members.some(
    m => m.userId.equals(user._id) && m.status === 'accepted'
  );
},

DELETE_TEAM: ({ user, team }) => {
  return Boolean(user && team && !team.isLocked && team.leader.equals(user._id));
},

VIEW_TEAM_DETAILS: ({ user, team, hackathon }) => {
  if (!user || !team || !hackathon) return false;
  if (user.systemRole === 'admin') return true;
  if (team.leader.equals(user._id)) return true;

  const isMember = team.members.some(
    m => m.userId.equals(user._id) && m.status === 'accepted'
  );
  if (isMember) return true;

  return user.hackathonRoles?.some(
    r =>
      r.hackathonId.equals(hackathon._id) &&
      (r.role === 'organizer' || r.role === 'judge')
  );
},

/* =====================================================
   HACKATHON POLICIES
===================================================== */

CREATE_HACKATHON: ({ user }) => {
  return user?.systemRole === 'admin' || user?.systemRole === 'mentor';
},

UPDATE_HACKATHON: ({ user, hackathon }) => {
  if (!user || !hackathon) return false;
  if (user.systemRole === 'admin' || user.systemRole === 'mentor') return true;

  return user.hackathonRoles?.some(
    r => r.hackathonId.equals(hackathon._id) && r.role === 'organizer'
  );
},

DELETE_HACKATHON: ({ user }) => {
  return user?.systemRole === 'admin' || user?.systemRole === 'mentor';
},

ASSIGN_JUDGE: ({ user, hackathon }) => {
  if (!user || !hackathon) return false;
  if (user.systemRole === 'admin' || user.systemRole === 'mentor') return true;

  return user.hackathonRoles?.some(
    r => r.hackathonId.equals(hackathon._id) && r.role === 'organizer'
  );
},

REMOVE_JUDGE: ({ user, hackathon }) => {
  if (!user || !hackathon) return false;
  if (user.systemRole === 'admin' || user.systemRole === 'mentor') return true;

  return user.hackathonRoles?.some(
    r => r.hackathonId.equals(hackathon._id) && r.role === 'organizer'
  );
},

/* =====================================================
   SUBMISSION POLICIES
===================================================== */
CREATE_SUBMISSION: ({ user, team, hackathon, existingSubmission }) => {
  if (!user || !team || !hackathon) return false;
  if (!team.leader.equals(user._id)) return false;
  
  // 🔥 NEW: Check for minimum members (e.g., 3 members)
  const acceptedMembers = team.members.filter(m => m.status === 'accepted');
  if (acceptedMembers.length < 3) return false; 

  if (!team.hackathonId.equals(hackathon._id)) return false;
  if (hackathon.status !== 'ongoing') return false;
  if (new Date() > new Date(hackathon.endDate)) return false;
  if (existingSubmission) return false;

  return true;
},
UPDATE_SUBMISSION: ({ user, team, hackathon, submission }) => {
  if (!user || !team || !hackathon || !submission) return false;
  if (!team.leader.equals(user._id)) return false;
  if (!submission.teamId.equals(team._id)) return false;
  if (hackathon.status !== 'ongoing') return false;
  if (new Date() > new Date(hackathon.endDate)) return false;

  return true;
},

VIEW_SUBMISSION: ({ user, team, submission }) => {
  if (!user || !submission) return false;
  if (user.systemRole === 'admin') return true;

  if (team) {
    if (team.leader.equals(user._id)) return true;
    if (team.members.some(m => m.userId.equals(user._id) && m.status === 'accepted')) return true;
  }

  return user.hackathonRoles?.some(
    r => r.hackathonId.equals(submission.hackathonId) && r.role === 'judge'
  );
},

/* =====================================================
   EVALUATION POLICIES
===================================================== */

CREATE_EVALUATION: ({ user, hackathon }) => {
  if (!user || !hackathon) return false;
  if (user.systemRole === 'admin') return true;

  return user.hackathonRoles?.some(
    r => r.hackathonId.equals(hackathon._id) && r.role === 'judge'
  );
},

UPDATE_EVALUATION: ({ user, evaluation }) => {
  if (!user || !evaluation) return false;
  if (evaluation.status === 'locked') return false;
  if (user.systemRole === 'admin') return true;

  return evaluation.judgeId.equals(user._id);
},

LOCK_EVALUATION: ({ user }) => {
  return user?.systemRole === 'admin' || user?.systemRole === 'mentor';
},

VIEW_EVALUATION: ({ user, hackathon, team }) => {
  if (!user || !hackathon || !team) return false;

  if (user.systemRole === 'admin' || user.systemRole === 'mentor') return true;

  const isJudge = user.hackathonRoles?.some(
    r => r.hackathonId.equals(hackathon._id) && r.role === 'judge'
  );
  if (isJudge) return true;

  const isOrganizer = user.hackathonRoles?.some(
    r => r.hackathonId.equals(hackathon._id) && r.role === 'organizer'
  );
  if (isOrganizer) return true;

  if (team.leader.equals(user._id)) return true;

  return team.members.some(
    m => m.userId.equals(user._id) && m.status === 'accepted'
  );
},

DELETE_EVALUATION: ({ user }) => {
  return user?.systemRole === 'admin' || user?.systemRole === 'mentor';
}

};

export default policy;