import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import { embedUser, searchTeam } from '../controllers/search.controller.js';

const router = express.Router();

/*
  Functionality: Check user profile readiness for teammate search
  Method: POST /api/ai/embed
  Response: Success message indicating profile is ready for teammate search
*/
router.post('/embed', auth, embedUser);

/*
  Functionality: Search for teammates by skills/tags
  Method: GET /api/ai/search
  Params: ?tags=skill1,skill2,skill3 (comma-separated skills)
  Example: GET /api/ai/search?tags=javascript,react,nodejs
  Response: List of users matching the provided skills, sorted by match count
*/
router.get('/search', auth, searchTeam);

export default router;