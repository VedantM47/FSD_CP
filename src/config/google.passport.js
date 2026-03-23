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
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/oauth/google/callback`,
      },
     async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          
          // 1. Check if user already exists BY EMAIL first
          let user = await User.findOne({ email: email });

          if (user) {
            // 2. If user exists but doesn't have a googleId yet, link it!
            if (!user.googleId) {
              user.googleId = profile.id;
              // We don't overwrite the authProvider if they signed up with 'local' originally, 
              // but you can if you want. Let's just save the googleId.
              await user.save();
            }
            return done(null, user); // Log them in!
          }

          // 3. If user DOES NOT exist at all, create a brand new one
          user = await User.create({
            fullName: profile.displayName,
            email: email,
            googleId: profile.id,
            authProvider: 'google',
            systemRole: 'user',
          });

          return done(null, user);
        } catch (err) {
          console.error("Google Auth Error:", err);
          return done(err, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth strategy registered');
} else {
  console.warn('⚠️  Google OAuth credentials not set — Google login will be disabled');
}
