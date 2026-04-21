import express from 'express';
import auth from '../middlewares/auth.middleware.js';

import {
  getAdminDashboard,
  getAdminHackathons,
  getHackathonOverview,
  getAdminSubmissions,
  getAdminTeams,
  getAllJudges,
  assignJudgesToHackathon,
  broadcastEmail,
  getEmailQueueStatus,
  updateUserRole,
  getAdminUsers,
} from '../controllers/admin.controller.js';

const router = express.Router();

/* ---------- Admin-only guard ---------- */
const adminOnly = (req, res, next) => {
  if (req.user?.systemRole !== 'admin') {
    return next({ statusCode: 403, message: 'Admin access required' });
  }
  next();
};

/* All routes below require authentication + admin role */
router.use(auth, adminOnly);

router.get('/dashboard', getAdminDashboard);
router.get('/hackathons', getAdminHackathons);
router.get('/hackathons/:id/overview', getHackathonOverview);
router.get('/submissions', getAdminSubmissions);
router.get('/teams', getAdminTeams);

router.get('/judges', getAllJudges);
router.post('/hackathons/:id/judges', assignJudgesToHackathon);
router.post('/broadcast', broadcastEmail);
router.get('/email-queue', getEmailQueueStatus);
router.post('/users/role', updateUserRole);
router.get('/users', getAdminUsers);

export default router;