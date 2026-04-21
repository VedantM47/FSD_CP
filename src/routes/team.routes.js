import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.js';


import {
  createTeam,
  requestJoinTeam,
  manageTeamMember,
  updateTeam,
  leaveTeam,
  getPendingJoinRequests,
  deleteTeam,
  getTeamDetails,
  searchTeams,
  publicTeamSearch,
  withdrawJoinRequest,
  discoverMembers,
  inviteMember,
  respondToInvite,
} from '../controllers/team.controller.js';

import Team from '../models/team.model.js';
import Hackathon from '../models/hackathon.model.js';

const router = express.Router();

/* ================= PUBLIC DISCOVERY ================= */

// Anyone logged in can see open teams in a hackathon
router.get(
  "/hackathon/:hackathonId/public",
  auth,
  publicTeamSearch
);


/* ================= PROTECTED TEAM VIEWS ================= */

// Search teams (participants / judges / organizers)
router.get(
  "/hackathon/:hackathonId/search",
  auth,
  authorize("VIEW_TEAM_DETAILS"),
  searchTeams
);


/* ================= CREATE TEAM ================= */
router.post(
  '/',
  auth,
  authorize('CREATE_TEAM', async (req) => {
    const hackathon = await Hackathon.findById(req.body.hackathonId);
    const existingTeam = await Team.findOne({
      hackathonId: req.body.hackathonId,
      'members.userId': req.user._id,
      'members.status': 'accepted',
    });
    console.log({ existingTeam }, 'existingTeam in team.routes', hackathon, req.user._id);
    return {
      user: req.user,
      hackathon,
      existingTeam,
    };
  }),
  createTeam
);

/* ================= GET TEAM DETAILS ================= */
router.get(
  '/:teamId',
  auth,
  authorize('VIEW_TEAM_DETAILS', async (req) => {
    const team = await Team.findById(req.params.teamId);
    const hackathon = team
      ? await Hackathon.findById(team.hackathonId)
      : null;

    return {
      user: req.user,
      team,
      hackathon,
    };
  }),
  getTeamDetails
);

/* ================= REQUEST JOIN TEAM ================= */
router.post(
  '/:teamId/join',
  auth,
  authorize('REQUEST_JOIN_TEAM', async (req) => {
    const team = await Team.findById(req.params.teamId);
    const hackathon = await Hackathon.findById(team.hackathonId);

    const isAlreadyInTeam = await Team.findOne({
      hackathonId: team.hackathonId,
      'members.userId': req.user._id,
      'members.status': 'accepted',
    });

    return {
      user: req.user,
      team,
      hackathon,
      isAlreadyInTeam,
    };
  }),
  requestJoinTeam
);

/* ================= WITHDRAW JOIN REQUEST ================= */
router.delete(
  '/:teamId/join',
  auth,
  withdrawJoinRequest
);

//* ================= GET PENDING JOIN REQUESTS ================= */
router.get(
  '/:teamId/requests',
  auth,
  authorize('MANAGE_TEAM_MEMBERS', async (req) => {
    const team = await Team.findById(req.params.teamId);
    return { user: req.user, team };
  }),
  getPendingJoinRequests
);

/* ================= ACCEPT / REJECT MEMBER ================= */
router.patch(
  '/:teamId/member',
  auth,
  authorize('MANAGE_TEAM_MEMBERS', async (req) => {
    const team = await Team.findById(req.params.teamId);
    return { user: req.user, team };
  }),
  manageTeamMember
);

/* ================= UPDATE TEAM ================= */
router.patch(
  '/:teamId',
  auth,
  authorize('UPDATE_TEAM', async (req) => {
    const team = await Team.findById(req.params.teamId);
    return { user: req.user, team };
  }),
  updateTeam
);

/* ================= LEAVE TEAM ================= */
router.delete(
  '/:teamId/leave',
  auth,
  authorize('LEAVE_TEAM', async (req) => {
    const team = await Team.findById(req.params.teamId);
    return { user: req.user, team };
  }),
  leaveTeam
);


/* ================= DELETE TEAM ================= */
router.delete(
  '/:teamId',
  auth,
  authorize('DELETE_TEAM', async (req) => {
    const team = await Team.findById(req.params.teamId);
    return { user: req.user, team };
  }),
  deleteTeam
);


/* ================= DISCOVER MEMBERS ================= */
router.get(
  '/:teamId/discover-members',
  auth,
  authorize('MANAGE_TEAM_MEMBERS', async (req) => {
    const team = await Team.findById(req.params.teamId);
    return { user: req.user, team };
  }),
  discoverMembers
);

/* ================= INVITE MEMBER ================= */
router.post(
  '/:teamId/invite',
  auth,
  authorize('MANAGE_TEAM_MEMBERS', async (req) => {
    const team = await Team.findById(req.params.teamId);
    return { user: req.user, team };
  }),
  inviteMember
);

/* ================= RESPOND TO INVITE ================= */
// User accepts or declines an invitation sent by leader
router.post(
  '/:teamId/invites/respond',
  auth,
  respondToInvite
);

export default router;