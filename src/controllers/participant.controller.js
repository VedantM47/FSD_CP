import Hackathon from '../models/hackathon.model.js';
import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import Submission from '../models/submission.model.js';
import log from '../utils/logger.js';

export const getParticipantDashboard = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user._id;

    log.info('GET_PARTICIPANT_DASHBOARD', `Fetching dashboard for user ${userId} in hackathon ${hackathonId}`);

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return next({ statusCode: 404, message: 'Hackathon not found' });
    }

    const user = await User.findById(userId);

    // 1. Profile Completion Check
    // We expect these fields to be filled for 100% completion in our checklist
    const requiredFields = ['college', 'residence'];
    const isProfileComplete = requiredFields.every(field => user[field] && user[field].toString().trim() !== '');

    // 2. Team Check
    const team = await Team.findOne({
      hackathonId,
      $or: [
        { leader: userId },
        { 'members.userId': userId, 'members.status': 'accepted' }
      ]
    });
    
    const isTeamFormed = !!team;

    // 3. Project Creation & Submission Check
    let isProjectCreated = false;
    let isProjectSubmitted = false;
    let submissionStatus = 'Not Started';
    let submissionData = null;

    if (team) {
      isProjectCreated = !!team.project?.title || !!team.project?.repoUrl;
      const submission = await Submission.findOne({ hackathonId, teamId: team._id });
      if (submission) {
        isProjectSubmitted = true;
        submissionStatus = submission.status; // 'submitted', 'under_review', 'graded', 'rejected'
        submissionData = submission;
      } else if (isProjectCreated) {
        submissionStatus = 'Draft';
      }
    }

    // 4. Time Check
    const now = new Date();
    let nextDeadlineName = 'Registration Closes';
    let nextDeadlineDate = hackathon.registrationDeadline;

    if (hackathon.registrationDeadline && now > hackathon.registrationDeadline) {
      nextDeadlineName = 'Prototype Submission';
      nextDeadlineDate = hackathon.prototypeDeadline;
    }
    if (hackathon.prototypeDeadline && now > hackathon.prototypeDeadline) {
      nextDeadlineName = 'Final Submission';
      nextDeadlineDate = hackathon.finalDeadline;
    }

    // 2.5 Invitations Check
    const invitedTeams = await Team.find({
      hackathonId,
      'members': { 
        $elemMatch: { userId, status: 'invited' } 
      }
    }).select('name leader').populate('leader', 'fullName email');

    const dashboardData = {
      hackathon: {
        id: hackathon._id,
        title: hackathon.title,
        status: hackathon.status,
        registrationDeadline: hackathon.registrationDeadline,
        prototypeDeadline: hackathon.prototypeDeadline,
        finalDeadline: hackathon.finalDeadline,
        presentationDate: hackathon.presentationDate,
        resultDate: hackathon.resultDate,
        maxTeamSize: hackathon.maxTeamSize || 4,
      },
      user: {
        isProfileComplete,
        hasResume: !!user.resumeUrl,
      },
      team: team ? {
        id: team._id,
        name: team.name,
        memberCount: team.members.filter(m => m.status === 'accepted').length + 1, // members + leader
        maxSize: team.maxSize || hackathon.maxTeamSize || 4,
        isLeader: team.leader.toString() === userId.toString(),
      } : null,
      invitations: invitedTeams.map(t => ({
        id: t._id,
        name: t.name,
        leaderName: t.leader?.fullName || 'Unknown Leader'
      })),
      project: {
        isCreated: isProjectCreated,
        isSubmitted: isProjectSubmitted,
        statusLabel: submissionStatus,
      },
      countdown: {
        name: nextDeadlineName,
        date: nextDeadlineDate,
      },
      checklist: {
        step1: isProfileComplete,
        step2: isTeamFormed,
        step3: isProjectCreated,
        step4: isProjectSubmitted,
      }
    };

    log.success('GET_PARTICIPANT_DASHBOARD', `Dashboard built for user ${userId}`);
    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (err) {
    log.error('GET_PARTICIPANT_DASHBOARD', 'Failed to fetch dashboard', err);
    next({ statusCode: 500, message: err.message });
  }
};
