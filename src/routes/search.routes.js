import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import { searchTeam } from '../controllers/search.controller.js';

const router = express.Router();

/*
  Functionality: Search for teammates by hackathon participation and skills
  Method: GET /api/search
  Params:
    - hackathonId (required)
    - name (optional partial match)
    - tags (optional comma-separated)
  Example: GET /api/search?hackathonId=123&name=alex&tags=javascript,react
*/
router.get('/', auth, searchTeam);

export default router;