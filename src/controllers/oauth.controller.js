import { signToken } from '../utils/jwt.js';

export const oauthCallback = async (req, res) => {
  // req.user is injected by passport
  const token = signToken({ id: req.user._id });

  res.status(200).json({
    success: true,
    provider: req.user.authProvider,
    token,
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.fullName,
    },
  });
};
