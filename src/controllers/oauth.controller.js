import { signToken } from '../utils/jwt.js';

export const oauthCallback = async (req, res) => {
  try {
    if (!req.user) {
      console.error("❌ User not found");
      return res.redirect('http://localhost:5173/login?error=no_user');
    }

    const token = signToken({ 
      id: req.user._id, 
      role: req.user.systemRole || 'user' 
    });

    // Hardcoded URL for testing (Jab tak env fix nahi hota)
    const targetURL = `http://localhost:5173/login-success?token=${token}`;
    
    console.log("🚀 Redirecting to:", targetURL);
    
    // Direct browser redirect
    return res.redirect(targetURL); 

  } catch (error) {
    console.error("🔥 Error in Callback:", error.message);
    return res.redirect('http://localhost:5173/login?error=server_error');
  }
};