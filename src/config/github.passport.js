import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/user.model.js';

// Explicitly naming the strategy 'github' to match the route authenticate('github')
passport.use('github', new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/api/oauth/github/callback',
    scope: ['user:email'], // Required to fetch the user's email from GitHub
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Extract email (GitHub returns an array of emails)
      const email = profile.emails?.[0]?.value || null;

      // 2. Check if user already exists in DB by GitHub ID or Email
      let user = await User.findOne({ 
        $or: [{ githubId: profile.id }, { email: email }] 
      });

      if (!user) {
        // 3. Create new user if not found
        user = await User.create({
          fullName: profile.displayName || profile.username,
          email: email,
          githubId: profile.id,
          authProvider: 'github',
          systemRole: 'user',
          isVerified: true, // OAuth verified accounts are trusted
        });
        console.log(`✅ New GitHub User Created: ${user.fullName}`);
      } else if (!user.githubId) {
        // 4. If user exists by email but GitHub isn't linked, link it now
        user.githubId = profile.id;
        user.authProvider = 'github'; 
        await user.save();
        console.log(`Linked GitHub to existing account: ${user.email}`);
      }

      // 5. Success - pass user to next middleware
      return done(null, user);
    } catch (error) {
      console.error("❌ GitHub Auth Strategy Error:", error);
      return done(error, null);
    }
  }
));

export default passport;