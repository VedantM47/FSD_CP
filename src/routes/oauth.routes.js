import express from 'express';
import passport from 'passport';
import { oauthCallback } from '../controllers/oauth.controller.js';

const router = express.Router();

/* ================= GOOGLE ================= */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],   // REQUIRED
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/test',
  }),
  oauthCallback
);

/* ================= GITHUB ================= */
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email'],         // REQUIRED
    session: false,
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/test',
  }),
  oauthCallback
);

export default router;
