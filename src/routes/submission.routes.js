import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.js';

import {
  createSubmission,
  updateSubmission,
  getSubmission,
} from '../controllers/submission.controller.js';

import Submission from '../models/submission.model.js';
import Team from '../models/team.model.js';
import Hackathon from '../models/hackathon.model.js';

const router = express.Router();

/* ================= PROTECTED ================= */

// 1. Create Submission (Leader Only)
router.post(
  '/',
  auth,
  authorize('CREATE_SUBMISSION', async (req) => {
    const { hackathonId, teamId } = req.body;
    
    const hackathon = await Hackathon.findById(hackathonId);
    const team = await Team.findById(teamId);
    
    // Check if they already submitted (to prevent duplicates in policy)
    // We assume default round is 'Round 1' for now
    const existingSubmission = await Submission.findOne({ 
      hackathonId, 
      teamId, 
      round: 'Round 1' 
    });

    return { 
      user: req.user, 
      hackathon, 
      team, 
      existingSubmission 
    };
  }),
  createSubmission
);

// 2. Update Submission (Leader Only)
router.put(
  '/:submissionId',
  auth,
  authorize('UPDATE_SUBMISSION', async (req) => {
    const submission = await Submission.findById(req.params.submissionId);
    
    // Safety check: if submission doesn't exist, policy will fail gracefully
    if (!submission) return { user: req.user };

    const team = await Team.findById(submission.teamId);
    const hackathon = await Hackathon.findById(submission.hackathonId);

    return { 
      user: req.user, 
      submission, 
      team, 
      hackathon 
    };
  }),
  updateSubmission
);

// 3. View Submission (Judges, Leader, Team Members, Admin)
router.get(
  '/:submissionId',
  auth,
  authorize('VIEW_SUBMISSION', async (req) => {
    const submission = await Submission.findById(req.params.submissionId);

    if (!submission) return { user: req.user };

    const team = await Team.findById(submission.teamId);

    return { 
      user: req.user, 
      submission, 
      team 
    };
  }),
  getSubmission
);

export default router;