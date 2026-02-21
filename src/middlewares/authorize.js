import policy from '../policies/policy.js';
import log from '../utils/logger.js';


const authorize = (action, getContext) => {
  return async (req, res, next) => {
    try {
      // Step 1: Check if policy exists
      if (!policy[action]) {
        log.error('AUTHORIZE', `Policy "${action}" is NOT defined — check policy.js`);
        return next({
          statusCode: 500,
          message: `Authorization policy "${action}" not defined`,
        });
      }

      // Step 2: Build context
      log.info('AUTHORIZE', `Building context for "${action}" — ${req.method} ${req.originalUrl}`);
      const context = await getContext(req);

      // Step 3: Validate context
      if (!context || !context.user) {
        log.warn('AUTHORIZE', `Context invalid for "${action}" — missing user or null context`, {
          hasContext: !!context,
          hasUser: !!(context && context.user),
        });
        return next({
          statusCode: 403,
          message: 'Authorization context invalid',
        });
      }

      // Step 4: Log context details for debugging
      const contextSummary = {
        userId: context.user?._id,
        userRole: context.user?.systemRole,
        hackathonRoles: context.user?.hackathonRoles?.map(r => ({ hId: r.hackathonId, role: r.role })),
      };
      if (context.team) {
        contextSummary.teamId = context.team._id;
        contextSummary.teamLeader = context.team.leader;
        contextSummary.teamLocked = context.team.isLocked;
      }
      if (context.hackathon) {
        contextSummary.hackathonId = context.hackathon._id;
        contextSummary.hackathonStatus = context.hackathon.status;
      }
      if (context.existingTeam !== undefined) {
        contextSummary.existingTeam = !!context.existingTeam;
      }
      if (context.isAlreadyInTeam !== undefined) {
        contextSummary.isAlreadyInTeam = !!context.isAlreadyInTeam;
      }
      if (context.existingSubmission !== undefined) {
        contextSummary.existingSubmission = !!context.existingSubmission;
      }
      if (context.evaluation) {
        contextSummary.evaluationId = context.evaluation._id;
        contextSummary.evaluationStatus = context.evaluation.status;
      }
      log.info('AUTHORIZE', `Context for "${action}":`, contextSummary);

      // Step 5: Execute policy
      const isAllowed = policy[action](context);

      if (!isAllowed) {
        log.warn('AUTHORIZE', `ACCESS DENIED — action="${action}" user=${context.user.email} (${context.user.systemRole})`);
        return next({
          statusCode: 403,
          message: 'Access Denied',
        });
      }

      // Step 6: Granted
      log.success('AUTHORIZE', `ACCESS GRANTED — action="${action}" user=${context.user.email}`);
      next();
    } catch (error) {
      log.error('AUTHORIZE', `Authorization CRASHED for action="${action}"`, error);
      next({
        statusCode: 500,
        message: 'Authorization failed',
      });
    }
  };
};

export default authorize;