import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

// Serializing user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserializing user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/oauth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            authProvider: 'google',
            systemRole: 'user',
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);