import dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + '/.env' });

import express from 'express';
import passport from 'passport';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Middleware & Utilities
import errorHandler from './middlewares/error.middleware.js'; // Ensure this file exists, or comment out

// Route Imports
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import aiRoutes from './routes/ai.routes.js';
import problemRoutes from './routes/problem.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';

// Load OAuth strategies (Ensure these exist or comment out if not needed yet)
// import './config/google.passport.js';
// import './config/github.passport.js';

const app = express();

const apilimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: 'Too many Requests',
});

// Middleware: CORS
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Middleware to add rate limiter (Apply globally or to specific routes)
app.use(apilimiter);

// Serve Static Files (Resolve public relative to src)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Test Route
app.get('/test', (req, res) => {
  res.send('API is working fine');
});

// Root endpoint – serve simple test UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Global Error Handling Middleware
app.use(errorHandler);

export default app;