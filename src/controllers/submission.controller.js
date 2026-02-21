import Submission from '../models/submission.model.js';
import Team from '../models/team.model.js';
import Hackathon from '../models/hackathon.model.js';
import log from '../utils/logger.js';

/* ================= CREATE SUBMISSION ================= */

export const createSubmission = async (req, res, next) => {
  try {
    const { hackathonId, teamId, title, description, pptLink, repoLink, demoLink, track } = req.body;
    log.info('CREATE_SUBMISSION', 'Creating submission', { hackathonId, teamId, track, by: req.user?.email });

    // 1. Create the submission document
    const newSubmission = await Submission.create({
      hackathonId,
      teamId,
      submittedBy: req.user._id,
      projectDetails: { title, description, pptLink, repoLink, demoLink },
      track,
    });

    log.info('CREATE_SUBMISSION', `Submission created (id=${newSubmission._id}), syncing team`);

    // 2. SYNC: Update the 'Team' model
    await Team.findByIdAndUpdate(teamId, {
      submissionId: newSubmission._id,
      project: {
        title,
        description,
        driveUrl: pptLink,
        repoUrl: repoLink,
        demoUrl: demoLink,
        submittedAt: new Date()
      },
      isLocked: true
    });

    // 3. Success Response
    log.success('CREATE_SUBMISSION', `Submission complete: "${title}"`);
    res.status(201).json({
      success: true,
      message: "Project submitted successfully!",
      submission: newSubmission
    });
  } catch (err) {
    log.error('CREATE_SUBMISSION', 'Failed to create submission', err);
    next(err);
  }
};

// NOTE: createEvaluation lives in evaluation.controller.js — removed duplicate here

// ================= GET SUBMISSION DETAILS =================
export const getSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    log.info('GET_SUBMISSION', 'Fetching submission', { submissionId, by: req.user?.email });

    
    const submission = await Submission.findById(submissionId)
      .populate('teamId', 'name leader members') 
      .populate('submittedBy', 'fullName email') 
      .populate('hackathonId', 'title');         

    if (!submission) {
      log.warn('GET_SUBMISSION', `Not found: ${submissionId}`);
      return next({ statusCode: 404, message: "Submission not found" });
    }

    log.success('GET_SUBMISSION', `Found submission: "${submission.projectDetails?.title}"`);
    // 2. Return Data
    res.status(200).json({
      success: true,
      submission
    });

  } catch (error) {
    log.error('GET_SUBMISSION', 'Failed to fetch submission', error);
    next(error);
  }
};

// ================= CONTEXT FOR UPDATING SUBMISSION =================
const getUpdateContext = async (req) => {
  const { submissionId } = req.params;
  
  const submission = await Submission.findById(submissionId);
  if (!submission) return null; 

  const team = await Team.findById(submission.teamId);
  const hackathon = await Hackathon.findById(submission.hackathonId);

  return {
    user: req.user,
    submission,
    team,
    hackathon
  };
};

// ================= UPDATE SUBMISSION =================
export const updateSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params; 
    const { 
      title, 
      description, 
      pptLink, 
      repoLink, 
      demoLink,
      track 
    } = req.body;

    log.info('UPDATE_SUBMISSION', 'Updating submission', { submissionId, fields: Object.keys(req.body), by: req.user?.email });

    // 1. Find and Update the Submission
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        track,
        projectDetails: {
          title,
          description,
          pptLink,
          repoLink,
          demoLink
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedSubmission) {
      log.warn('UPDATE_SUBMISSION', `Not found: ${submissionId}`);
      return next({ statusCode: 404, message: "Submission not found" });
    }

    // 2. SYNC: Update the 'Team' model to match
    await Team.findByIdAndUpdate(updatedSubmission.teamId, {
      project: {
        title: title,
        description: description,
        driveUrl: pptLink,
        repoUrl: repoLink,
        demoUrl: demoLink,
        submittedAt: updatedSubmission.updatedAt
      }
    });

    log.success('UPDATE_SUBMISSION', `Submission updated: "${title}"`);
    res.status(200).json({
      success: true,
      message: "Submission updated successfully!",
      submission: updatedSubmission
    });

  } catch (error) {
    log.error('UPDATE_SUBMISSION', 'Failed to update submission', error);
    next(error);
  }
};
