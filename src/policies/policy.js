// src/policies/policy.js

// this files defines various permission checks for actions within the our system.
// Each function takes relevant context (like user, hackathon, team) and returns a boolean indicating if the action is permitted,
// either we can say the user has the permission to perform that action or not.

const can = {
  CREATE_TEAM: ({ user, hackathon }) => {
    return (
      hackathon.status === 'open' &&
      !user.hackathonRoles.some(
        r => r.hackathonId.equals(hackathon._id) && r.role === 'judge'
      )
    );
  },

  UPDATE_TEAM: ({ user, team }) => {
    return team.leader.equals(user._id);
  },

  JOIN_TEAM: ({ user, team }) => {
    return (
      team.isOpenToJoin &&
      team.members.length < team.maxSize &&
      !team.isLocked
    );
  },

  VIEW_SUBMISSIONS: ({ user, hackathon }) => {
    return user.hackathonRoles.some(
      r => r.hackathonId.equals(hackathon._id) && r.role === 'judge'
    );
  },

  ADMIN_ALL: ({ user }) => {
    return user.systemRole === 'admin';
  },
};

module.exports = can;