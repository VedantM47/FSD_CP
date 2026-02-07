import dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + '/.env' });
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/user.model.js';

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/oauth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already exists
        let user = await User.findOne({ githubId: profile.id });

        // 2. If not, create new user
        if (!user) {
          user = await User.create({
            name: profile.username,
            email: profile.emails?.[0]?.value || null,
            githubId: profile.id,
            authProvider: 'github',
            systemRole: 'user',
          });
        }

        // 3. Pass user to next middleware
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);
