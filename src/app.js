import dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + '/.env' });

import express from 'express';
import passport from 'passport';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Middleware & Utilities
import errorHandler from './middlewares/error.middleware.js';

// Route Imports
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Load OAuth strategies
import './config/google.passport.js';
import './config/github.passport.js';

const app = express();

const apilimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: 'Too many Request',
});

// Middleware: CORS (Added)
// I had to add this to test with frontend
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

// Middleware to parse JSON requests
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Middleware to add rate limiter
app.use(apilimiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/ai', aiRoutes);

// Test Route
app.get('/test', (req, res) => {
  res.send('API is working fine');
});

// Global Error Handling Middleware
app.use(errorHandler);

export default app;