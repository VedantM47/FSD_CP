import User from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';


const auth = async (req, res, next) => {
  try {
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
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