import express from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import errorHandler from './middlewares/error.middleware.js';

import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import sumbissionRoutes from './routes/submission.routes.js';
import rateLimit from 'express-rate-limit';
import evaluationRoutes from './routes/evaluation.routes.js';
import adminRoutes from './routes/admin.routes.js';
import oauthRoutes from './routes/oauth.routes.js';


const app = express();

/* ================= CORS (MUST BE FIRST) ================= */
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  })
);

/* ================= RATE LIMITER ================= */
const apiLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: 'Too many requests, please try again later.',
});

/* ================= MIDDLEWARES ================= */
app.use(express.json());
// app.use(apiLimiter);
app.use(passport.initialize());

/* ================= ROUTES ================= */
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/hackathons', hackathonRoutes);
// Calendar Routes
app.use('/api/calendar', calendarRoutes);
app.use('/api/submissions', sumbissionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/oauth', oauthRoutes);


/* ================= HEALTH CHECK ================= */
app.get('/test', (req, res) => {
  res.status(200).json({ success: true, message: 'API is working fine' });
});

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

export default app;
