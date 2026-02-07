import policy from '../policies/policy.js';


const authorize = (action, getContext) => {
  return async (req, res, next) => {
    try {
      // 1️⃣ Ensure policy exists
      if (!policy[action]) {
        return next({
          statusCode: 500,
          message: `Authorization policy "${action}" not defined`,
        });
      }

      // 2️⃣ Build context (user, team, hackathon, etc.)
      const context = await getContext(req);

      // 3️⃣ Basic validation
      if (!context || !context.user) {
        return next({
          statusCode: 403,
          message: 'Authorization context invalid',
        });
      }

      // 4️⃣ Execute ABAC policy
      const isAllowed = policy[action](context);

      if (!isAllowed) {
        return next({
          statusCode: 403,
          message: 'Access Denied',
        });
      }

      // 5️⃣ Permission granted
      next();
    } catch (error) {
      next({
        statusCode: 500,
        message: 'Authorization failed',
      });
    }
  };
};

export default authorize;