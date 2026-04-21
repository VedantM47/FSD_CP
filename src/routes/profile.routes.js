import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import { getMyProfile } from '../controllers/profile.controller.js';

const router = express.Router();

// GET /api/profile/me — aggregated profile for the logged-in user
router.get('/me', auth, getMyProfile);

export default router;
