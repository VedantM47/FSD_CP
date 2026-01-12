import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import { embedUser, searchTeam } from '../controllers/ai.controller.js';

const router = express.Router();

/*
  Functionality: Generates a vector for the logged-in user based on their profile.
  Method: POST /api/ai/embed
*/
router.post('/embed', auth, embedUser);

/*
  Functionality: Returns users similar to the search query.
  Method: GET /api/ai/search
  Params: ?q=search_term (e.g. ?q=python backend)
*/
router.get('/search', auth, searchTeam);

export default router;