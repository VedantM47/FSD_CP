import express from 'express';
import { getRecommendation } from '../controllers/recommendation.controller.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get AI recommendation for a hackathon
router.get('/:hackathonId', auth, getRecommendation);

export default router;