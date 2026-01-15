import Submission from '../models/submission.model.js';
import Team from '../models/team.model.js';
import Hackathon from '../models/hackathon.model.js';

/* ================= CREATE SUBMISSION ================= */

export const createEvaluation = async (req, res, next) => {
  try {
    const { hackathonId, teamId, round, criteriaScores, remarks } = req.body;

    // Prevent duplicate
    const exists = await Evaluation.findOne({
      hackathonId,
      teamId,
      judgeId: req.user._id,
      round
    });

    if (exists) {
      return next({ statusCode: 400, message: "Already evaluated" });
    }

    // Compute total score
    let total = 0;
    let weightSum = 0;

    for (const key in criteriaScores) {
      const { score, weight } = criteriaScores[key];
      total += score * weight;
      weightSum += weight;
    }

    const evaluation = await Evaluation.create({
      hackathonId,
      teamId,
      judgeId: req.user._id,
      round,
      criteriaScores,
      totalScore: total,
      normalizedScore: total / weightSum,
      remarks,
      status: "submitted"
    });

    res.status(201).json({ success: true, data: evaluation });
  } catch (err) {
    next(err);
  }
};

// ================= GET SUBMISSION DETAILS =================
export const getSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    
    const submission = await Submission.findById(submissionId)
      .populate('teamId', 'name leader members') 
      .populate('submittedBy', 'fullName email') 
      .populate('hackathonId', 'title');         

    if (!submission) {
      return next({ statusCode: 404, message: "Submission not found" });
    }

    // 2. Return Data
    res.status(200).json({
      success: true,
      submission
    });

  } catch (error) {
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

    // 1. Find and Update the Submission
    // Note: Permissions are already checked by the Policy Middleware before this runs.
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
      { new: true, runValidators: true } // Return the updated doc & validate rules
    );

    if (!updatedSubmission) {
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

    res.status(200).json({
      success: true,
      message: "Submission updated successfully!",
      submission: updatedSubmission
    });

  } catch (error) {
    next(error);
  }
};


