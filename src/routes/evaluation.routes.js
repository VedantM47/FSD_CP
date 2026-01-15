import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.js';

import {
  createEvaluation,
  updateEvaluation,
  lockEvaluation,
  getEvaluationsByTeam,
  deleteEvaluation,
} from '../controllers/evaluation.controller.js';

import Hackathon from '../models/hackathon.model.js';
import Team from '../models/team.model.js';
import Evaluation from '../models/evaluation.model.js';

const router = express.Router();

/* =========================================================
   CREATE EVALUATION (Judge)
   ========================================================= */
router.post(
  '/hackathons/:hackathonId/teams/:teamId/evaluations',
  auth,
  authorize('CREATE_EVALUATION', async (req) => {
    const hackathon = await Hackathon.findById(req.params.hackathonId);
    const team = await Team.findById(req.params.teamId);

    return {
      user: req.user,
      hackathon,
      team,
    };
  }),
  createEvaluation
);

/* =========================================================
   UPDATE EVALUATION (Judge – own, not locked)
   ========================================================= */
router.patch(
  '/:evaluationId',
  auth,
  authorize('UPDATE_EVALUATION', async (req) => {
    const evaluation = await Evaluation.findById(req.params.evaluationId);
    return {
      user: req.user,
      evaluation,
    };
  }),
  updateEvaluation
);

/* =========================================================
   LOCK EVALUATION (Admin / Faculty)
   ========================================================= */
router.patch(
  '/:evaluationId/lock',
  auth,
  authorize('LOCK_EVALUATION', async (req) => ({
    user: req.user,
  })),
  lockEvaluation
);

/* =========================================================
   GET ALL EVALUATIONS FOR A TEAM
   (Leader / Member / Judge / Admin – via policy)
   ========================================================= */
router.get(
  '/hackathons/:hackathonId/teams/:teamId/evaluations',
  auth,
  authorize('VIEW_EVALUATION', async (req) => {
    const hackathon = await Hackathon.findById(req.params.hackathonId);
    const team = await Team.findById(req.params.teamId);

    return {
      user: req.user,
      hackathon,
      team,
    };
  }),
  getEvaluationsByTeam
);

/* =========================================================
   DELETE EVALUATION (Admin / Faculty)
   ========================================================= */
router.delete(
  '/:evaluationId',
  auth,
  authorize('DELETE_EVALUATION', async (req) => ({
    user: req.user,
  })),
  deleteEvaluation
);

export default router;