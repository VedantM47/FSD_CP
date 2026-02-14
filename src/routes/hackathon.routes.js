import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.js';

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
  searchHackathons
} from '../controllers/hackathon.controller.js';
   
import Hackathon from '../models/hackathon.model.js';

const router = express.Router();

/* ================= PUBLIC ================= */

// Get all hackathons
router.get('/', getAllHackathons);

// Get teams by hackathon ID
router.get(
  '/:hackathonId/teams',
  getTeamsByHackathon
);


/* ================= PUBLIC DISCOVERY ================= */

// Anyone logged-in can discover hackathons
router.get(
  "/search",
  auth,
  searchHackathons
);

// View a hackathon’s public info
router.get(
  "/:hackathonId",
  auth,
  getHackathonById
);

/* ================= PROTECTED ================= */

// Create hackathon (admin / Mentor)
router.post('/', createHackathon);

router.patch('/:id', updateHackathon);


// Update hackathon status (admin / organizer / Mentor)
router.patch('/:id/status', updateHackathonStatus);

/* ================= ASSIGN JUDGE ================= */
router.post(
  '/:hackathonId/judges',
  auth,
  authorize('ASSIGN_JUDGE', async (req) => {
    const hackathon = await Hackathon.findById(req.params.hackathonId);
    return {
      user: req.user,
      hackathon,
    };
  }),
  assignJudgeToHackathon
);


// * ================= REMOVE JUDGE ================= */
router.delete(
  '/:hackathonId/judges/:judgeUserId',
  auth,
  authorize('REMOVE_JUDGE', async (req) => {
    const hackathon = await Hackathon.findById(req.params.hackathonId);
    return {
      user: req.user,
      hackathon,
    };
  }),
  removeJudgeFromHackathon
);


// Delete hackathon (admin / Mentor)
router.delete(
  '/:id',
  auth,
  authorize('DELETE_HACKATHON', async (req) => {
    const hackathon = await Hackathon.findById(req.params.id);
    return { user: req.user, hackathon };
  }),
  deleteHackathon
);

export default router;

