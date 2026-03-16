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

// Only register the Google strategy when real credentials are provided.
// Without this guard the server crashes at startup when the env vars are missing/placeholder.
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const credentialsPresent = googleClientId && googleClientSecret &&
  googleClientId !== 'placeholder_client_id';

if (credentialsPresent) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
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
  console.log('✅ Google OAuth strategy registered');
} else {
  console.warn('⚠️  Google OAuth credentials not set — Google login will be disabled');
}
