import User from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';


const auth = async (req, res, next) => {
  try {
    let token;
    
    //  Robust JWT extraction using regex
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/);
    if (match && match[1]) {
      token = match[1];
    }
    
    if (!token) {
      return next({
        statusCode: 401,
        message: 'Not authenticated',
      });
    }
    
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next({
        statusCode: 401,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next({
      statusCode: 401,
      message: 'Invalid token',
    });
  }
};

export default auth;