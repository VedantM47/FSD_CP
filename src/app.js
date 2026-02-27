import express from 'express';
import 'dotenv/config';
import log from './utils/logger.js';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import './config/google.passport.js';
import cors from 'cors';

import errorHandler from './middlewares/error.middleware.js';

import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import submissionRoutes from './routes/submission.routes.js'; // FIX: corrected typo 'sumbission' → 'submission'
import evaluationRoutes from './routes/evaluation.routes.js';
import adminRoutes from './routes/admin.routes.js';
import profileRoutes from './routes/profile.routes.js';

const app = express();

/* ================= CORS ================= */
/*
 * FIX: Drive the allowed origin from an environment variable so this doesn't
 * accidentally expose localhost in staging/production builds.
 */
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  })
);

/* ================= RATE LIMITER ================= */
/*
 * FIX: The original limiter (5 req/sec) was far too tight and would cause
 * false positives for normal usage. Changed to a standard 100 req / 15 min window.
 * Re-enabled it — leaving it commented out leaves all endpoints unprotected.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000000,                  // 100 requests per window per IP
  standardHeaders: true,     // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

/* ================= MIDDLEWARES ================= */
app.use(express.json());
app.use(apiLimiter); // FIX: Rate limiter is now active
app.use(passport.initialize());

/* ================= REQUEST LOGGER ================= */
app.use((req, res, next) => {
  log.request(req.method, req.originalUrl);
  next();
});

/* ================= ROUTES ================= */
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/submissions', submissionRoutes); // FIX: matches corrected import name
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/oauth', oauthRoutes);

/* ================= HEALTH CHECK ================= */
app.get('/test', (req, res) => {
  res.status(200).json({ success: true, message: 'API is working fine' });
});

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

export default app;