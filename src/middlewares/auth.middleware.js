import User from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';
import log from '../utils/logger.js';


const auth = async (req, res, next) => {
  try {
    let token;
    
    // Step 1: Extract JWT from header
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/);
    if (match && match[1]) {
      token = match[1];
    }
    
    if (!token) {
      log.warn('AUTH', `No token provided — ${req.method} ${req.originalUrl}`);
      return next({
        statusCode: 401,
        message: 'Not authenticated',
      });
    }
    
    // Step 2: Verify token
    log.info('AUTH', `Verifying token for ${req.method} ${req.originalUrl}`);
    const decoded = verifyToken(token);

    // Step 3: Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      log.warn('AUTH', `Token valid but user not found — id=${decoded.id}`);
      return next({
        statusCode: 401,
        message: 'User not found',
      });
    }

    log.success('AUTH', `Authenticated: ${user.email} (role=${user.systemRole})`);
    req.user = user;
    next();
  } catch (err) {
    log.error('AUTH', `Token verification failed — ${req.method} ${req.originalUrl}`, err);
    next({
      statusCode: 401,
      message: 'Invalid token',
    });
  }
};

export default auth;