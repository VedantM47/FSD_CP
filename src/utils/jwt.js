import jwt from 'jsonwebtoken';


// Sign JWT token
 
export const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};


// Verify JWT token

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};