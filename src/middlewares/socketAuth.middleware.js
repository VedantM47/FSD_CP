import { verifyToken } from '../utils/jwt.js';
import User from '../models/user.model.js';

/*
  Functionality: Socket Authentication Middleware
  Verifies the JWT token sent during the initial socket connection handshake.
  
  Input: Token from socket.handshake.auth or headers
  Output: Attaches user to socket.user and proceeds, or returns connection error
*/
const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('fullName email systemRole');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user details to the socket instance for use in event handlers
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};

export default socketAuth;