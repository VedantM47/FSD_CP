import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.js';
import { upload } from '../utils/upload.js';

import {
  createHackathon,
  getAllHackathons,
  getHackathonById,
  updateHackathon,
  updateHackathonStatus,
  deleteHackathon,
  getTeamsByHackathon,
  assignJudgeToHackathon,
  removeJudgeFromHackathon,
  searchHackathons,
} from '../controllers/hackathon.controller.js';
   
import Hackathon from '../models/hackathon.model.js';

const router = express.Router();

/* ================= PUBLIC ROUTES ================= */

// Get all hackathons
router.get('/', getAllHackathons);

// Get teams by hackathon ID
router.get('/:hackathonId/teams', getTeamsByHackathon);


/* ================= PUBLIC DISCOVERY ================= */

// Anyone logged-in can discover hackathons
router.get("/search", auth, searchHackathons);

// View a hackathon's public info
router.get("/:id", auth, getHackathonById);


/* ================= PROTECTED ADMIN/ORGANIZER ROUTES ================= */

// CREATE HACKATHON
// Policy expects: { user }
router.post(
  '/', 
  auth,
  authorize('CREATE_HACKATHON', (req) => {
    return { user: req.user };
  }),
  upload.single('image'), 
  createHackathon
);

// UPDATE HACKATHON
// Policy expects: { user, hackathon }
router.patch(
  '/:id',
  auth, 
  authorize('UPDATE_HACKATHON', async (req) => {
    const hackathon = await Hackathon.findById(req.params.id);
    return { user: req.user, hackathon };
  }),
  upload.single('image'), 
  updateHackathon
);

// UPDATE HACKATHON STATUS
// Policy expects: { user, hackathon }
// Using UPDATE_HACKATHON policy since changing status requires the same permissions
router.patch(
  '/:id/status', 
  auth,
  authorize('UPDATE_HACKATHON', async (req) => {
    const hackathon = await Hackathon.findById(req.params.id);
    return { user: req.user, hackathon };
  }),
  updateHackathonStatus
);


/* ================= ASSIGN/REMOVE JUDGE ================= */

// ASSIGN JUDGE
// Policy expects: { user, hackathon }
router.post(
  '/:hackathonId/judges',
  auth,
  authorize('ASSIGN_JUDGE', async (req) => {
    const hackathon = await Hackathon.findById(req.params.hackathonId);
    return { user: req.user, hackathon };
  }),
  assignJudgeToHackathon
);

// REMOVE JUDGE
// Policy expects: { user, hackathon }
router.delete(
  '/:hackathonId/judges/:judgeUserId',
  auth,
  authorize('REMOVE_JUDGE', async (req) => {
    const hackathon = await Hackathon.findById(req.params.hackathonId);
    return { user: req.user, hackathon };
  }),
  removeJudgeFromHackathon
);


/* ================= DELETE HACKATHON ================= */

// DELETE HACKATHON
// Policy expects: { user } (Based on your policy.js, it only checks user.systemRole)
router.delete(
  '/:id',
  auth,
  authorize('DELETE_HACKATHON', async (req) => {
    return { user: req.user };
  }),
  deleteHackathon
);

export default router;