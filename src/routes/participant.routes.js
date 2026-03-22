import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import { getParticipantDashboard } from '../controllers/participant.controller.js';

const router = express.Router();

router.get('/hackathon/:hackathonId/dashboard', auth, getParticipantDashboard);

export default router;
