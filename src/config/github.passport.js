import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/user.model.js';

// Only register the GitHub strategy when real credentials are provided.
// Without this guard the server crashes at startup when the env vars are missing/placeholder.
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const credentialsPresent = githubClientId && githubClientSecret &&
  githubClientId !== 'placeholder_client_id';

if (credentialsPresent) {
  // Explicitly naming the strategy 'github' to match the route authenticate('github')
  passport.use('github', new GitHubStrategy(
    {
      clientID: githubClientId,
      clientSecret: githubClientSecret,
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
        console.log(`✅ New GitHub User Created: ${user.fullName}`);
      if (!user.githubId) {
        // 4. If user exists by email but GitHub isn't linked, link it now
        user.githubId = profile.id;
        user.authProvider = 'github'; 
        await user.save();
        console.log(`Linked GitHub to existing account: ${user.email}`);
      }

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
          console.log(`🔗 Linked GitHub to existing account: ${user.email}`);
        }

        // 5. Success - pass user to next middleware
        return done(null, user);
      } catch (error) {
        console.error("❌ GitHub Auth Strategy Error:", error);
        return done(error, null);
      }
    }
  ));
} else {
  console.log("⚠️  GitHub OAuth credentials not configured. GitHub authentication will be unavailable.");
}

export default passport;