import express from 'express';
import {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} from '../controllers/problemController.js';

const router = express.Router();

// Problem statement routes
router.post('/', createProblem);
router.get('/', getProblems);
router.get('/:id', getProblemById);
router.put('/:id', updateProblem);
router.delete('/:id', deleteProblem);

export default router;

