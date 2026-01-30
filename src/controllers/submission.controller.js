import Submission from '../models/submission.model.js';
import Team from '../models/team.model.js';

export const createSubmission = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { 
      hackathonId, 
      teamId, 
      title, 
      description, 
      pptLink, 
      repoLink, 
      demoLink,
      track 
    } = req.body;

    // 1. Create the Submission Document
    const newSubmission = new Submission({
      hackathonId,
      teamId,
      submittedBy: userId,
      track,
      projectDetails: {
        title,
        description,
        pptLink,    
        repoLink,   
        demoLink    
      },
      status: 'submitted',
      round: 'Round 1' 
    });

    await newSubmission.save();

    // 2. SYNC: Update the 'Team' model
   
    await Team.findByIdAndUpdate(teamId, {
      submissionId: newSubmission._id,   
      project: {
        title: title,
        description: description,
        driveUrl: pptLink,   
        repoUrl: repoLink,
        demoUrl: demoLink,
        submittedAt: new Date()
      },
      isLocked: true 
    });


    // 3. Success Response
    res.status(201).json({ 
      success: true,
      message: "Project submitted successfully!", 
      submission: newSubmission
    });

  } catch (error) {
    // Handle Duplicate Key Error (Double Submission Race Condition)
    if (error.code === 11000) {
      return next({
        statusCode: 400,
        message: "A submission for this team already exists."
      });
    }
    next(error); 
  }
};
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


