import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2'; // Direct Import
import User from '../models/user.model.js';
import { oauthCallback } from '../controllers/oauth.controller.js';

const router = express.Router();

/**
 * 🛠️ FORCE REGISTRATION: 
 * Hum yahan strategy ko manually 'github' naam de rahe hain. 
 * Isse "Unknown authentication strategy" error 100% solve ho jayega.
 */
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const githubCredentialsPresent = githubClientId && githubClientSecret;

if (githubCredentialsPresent) {
  passport.use('github', new GitHubStrategy(
    {
      clientID: githubClientId,
      clientSecret: githubClientSecret,
      callbackURL: '/api/oauth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("📥 GitHub Login Attempt:", profile.username);
        const email = profile.emails?.[0]?.value || null;

        let user = await User.findOne({
          $or: [{ githubId: profile.id }, { email: email }]
        });

        if (!user) {
          user = await User.create({
            fullName: profile.displayName || profile.username,
            email: email,
            githubId: profile.id,
            authProvider: 'github',
            systemRole: 'user',
            isVerified: true
          });
          console.log("✅ New User Created via GitHub");
        }
        return done(null, user);
      } catch (error) {
        console.error("❌ GitHub Strategy Error:", error);
        return done(error, null);
      }
    }
  ));
  console.log('✅ GitHub OAuth strategy registered');
} else {
  console.warn('⚠️  GitHub OAuth credentials not set — GitHub login will be disabled');
}

/* ================= DEBUG ROUTE ================= */
router.get('/debug-env', (req, res) => {
  res.json({
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "NOT_FOUND",
    JWT_SECRET: process.env.JWT_SECRET ? "LOADED" : "NOT_FOUND",
    GITHUB_ID: process.env.GITHUB_CLIENT_ID ? "PRESENT" : "MISSING",
    PORT: process.env.PORT
  });
});

/* ================= GOOGLE ================= */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/test' }),
  oauthCallback
);

/* ================= GITHUB ================= */
// 🚀 Trigger GitHub Auth
router.get('/github', (req, res, next) => {
  console.log("🔗 Initiating GitHub OAuth...");
  passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
});

// 📥 Handle GitHub Callback
router.get('/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: 'http://localhost:5173/login?error=github_failed'
  }),
  oauthCallback
);

export default router;