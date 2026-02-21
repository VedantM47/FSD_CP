import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import Submission from '../models/submission.model.js';
import Hackathon from '../models/hackathon.model.js';
import Evaluation from '../models/evaluation.model.js';
import log from '../utils/logger.js';

/**
 * @desc    Get aggregated profile for the currently logged-in user
 * @route   GET /api/profile/me
 * @access  Private
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    log.info('PROFILE', `Aggregating profile for: ${req.user?.email}`);

    // 1. Full user document (with populated teams)
    const user = await User.findById(userId)
      .populate('teams')
      .lean();

    if (!user) {
      return next({ statusCode: 404, message: 'User not found' });
    }

    // 2. Teams where user is a member/leader
    const teams = await Team.find({
      $or: [
        { leader: userId },
        { 'members.userId': userId, 'members.status': 'accepted' },
      ],
    })
      .populate('hackathonId', 'title status startDate endDate')
      .populate('leader', 'fullName email')
      .populate('members.userId', 'fullName email')
      .lean();

    // 3. Submissions by this user
    const submissions = await Submission.find({ submittedBy: userId })
      .populate('hackathonId', 'title status')
      .populate('teamId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // 4. Hackathon IDs user participated in (from hackathonRoles)
    const hackathonRoleIds = (user.hackathonRoles || []).map(r => r.hackathonId);
    const hackathonsFromTeams = teams.map(t => t.hackathonId?._id).filter(Boolean);
    const allHackathonIds = [...new Set([
      ...hackathonRoleIds.map(id => id.toString()),
      ...hackathonsFromTeams.map(id => id.toString()),
    ])];

    const hackathons = await Hackathon.find({ _id: { $in: allHackathonIds } })
      .sort({ startDate: -1 })
      .lean();

    // 5. Evaluations for user's teams (to gather scores/feedback)
    const teamIds = teams.map(t => t._id);
    const evaluations = await Evaluation.find({ teamId: { $in: teamIds } })
      .populate('hackathonId', 'title')
      .lean();

    // 6. Compute stats
    const activeHackathons = hackathons.filter(h =>
      h.status === 'open' || h.status === 'ongoing'
    );

    // Determine user's role in each hackathon
    const hackathonDetails = hackathons.map(h => {
      const team = teams.find(t =>
        t.hackathonId?._id?.toString() === h._id.toString()
      );
      const isLeader = team?.leader?._id?.toString() === userId.toString();
      const role = isLeader
        ? 'Team Leader'
        : team
          ? 'Team Member'
          : 'Solo';

      // Determine status
      let status = 'Registered';
      if (h.status === 'ongoing') status = 'In Progress';
      else if (h.status === 'closed') status = 'Completed';

      // Check for submission result
      const sub = submissions.find(s =>
        s.hackathonId?._id?.toString() === h._id.toString()
      );
      const result = sub?.finalRank || (sub?.qualified ? 'Qualified' : '-');

      return {
        _id: h._id,
        title: h.title,
        status,
        role,
        result,
        startDate: h.startDate,
        endDate: h.endDate,
        teamName: team?.name || null,
        teamId: team?._id || null,
      };
    });

    // 7. Format teams for frontend
    const teamsFormatted = teams.map(t => {
      const hackathon = t.hackathonId;
      const isLeader = t.leader?._id?.toString() === userId.toString();
      const acceptedMembers = (t.members || []).filter(m => m.status === 'accepted');

      return {
        _id: t._id,
        name: t.name,
        hackathonName: hackathon?.title || 'Unknown',
        hackathonId: hackathon?._id,
        isLeader,
        membersCount: acceptedMembers.length,
        status: hackathon?.status === 'ongoing' || hackathon?.status === 'open'
          ? 'Active'
          : 'Completed',
        isOpenToJoin: t.isOpenToJoin,
        members: (t.members || []).map(m => ({
          name: m.userId?.fullName || 'Unknown',
          role: t.leader?._id?.toString() === m.userId?._id?.toString() ? 'Leader' : 'Member',
          status: m.status,
        })),
      };
    });

    // 8. Format submissions for frontend
    const submissionsFormatted = submissions.map(s => {
      // Find evaluations for this submission's team + hackathon
      const teamEvals = evaluations.filter(e =>
        e.teamId?.toString() === s.teamId?._id?.toString() &&
        e.hackathonId?._id?.toString() === s.hackathonId?._id?.toString()
      );
      const avgScore = teamEvals.length > 0
        ? Math.round(teamEvals.reduce((sum, e) => sum + (e.totalScore || 0), 0) / teamEvals.length)
        : null;

      return {
        _id: s._id,
        hackathonName: s.hackathonId?.title || 'Unknown',
        hackathonId: s.hackathonId?._id,
        teamName: s.teamId?.name || 'Unknown',
        round: s.round || 'Round 1',
        link: s.projectDetails?.repoLink || s.projectDetails?.demoLink || s.projectDetails?.pptLink || '',
        score: avgScore !== null ? `${avgScore}/100` : '-',
        feedbackStatus: teamEvals.length > 0 ? 'available' : 'pending',
        status: s.status,
      };
    });

    // 9. Build response
    const profile = {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        college: user.college || '',
        department: user.department || '',
        year: user.year || '',
        skills: user.skills || [],
        github: user.github || '',
        linkedin: user.linkedin || '',
        systemRole: user.systemRole,
        authProvider: user.authProvider,
      },
      stats: {
        hackathonsParticipated: hackathons.length,
        wins: submissions.filter(s => s.finalRank && s.finalRank <= 3).length,
        activeHackathons: activeHackathons.length,
      },
      hackathons: hackathonDetails,
      teams: teamsFormatted,
      submissions: submissionsFormatted,
    };

    log.success('PROFILE', `Profile aggregated: ${hackathons.length} hackathons, ${teams.length} teams, ${submissions.length} submissions`);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    log.error('PROFILE', 'Failed to aggregate profile', err);
    next({ statusCode: 500, message: 'Failed to load profile' });
  }
};
