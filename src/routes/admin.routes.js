import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import adminOnly from '../middlewares/admin.middleware.js';

import {
  getAdminDashboard,
  getAdminHackathons,
  getHackathonOverview,
  getAdminSubmissions,
  getAdminTeams,
} from '../controllers/admin.controller.js';

const router = express.Router();

// router.use(auth, adminOnly);

router.get('/dashboard', getAdminDashboard);
router.get('/hackathons', getAdminHackathons);
router.get('/hackathons/:id/overview', getHackathonOverview);
router.get('/submissions', getAdminSubmissions);
router.get('/teams', getAdminTeams);

export default router;
