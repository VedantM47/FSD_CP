import express from 'express';
import {
  extractTeamSkillsController,
  getTeamSkills,
  generateRecommendationsController,
  getRecommendations,
  getRecommendationStats,
} from '../controllers/recommendation.controller.js';

const router = express.Router();

// Team skill extraction routes
router.post('/teams/:teamId/extract-skills', extractTeamSkillsController);
router.get('/teams/:teamId/skills', getTeamSkills);

// Recommendation routes
router.post('/teams/:teamId/generate', generateRecommendationsController);
router.get('/teams/:teamId', getRecommendations);
router.get('/teams/:teamId/stats', getRecommendationStats);

export default router;

