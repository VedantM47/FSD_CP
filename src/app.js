import dotenv from 'dotenv';
// Point to the .env file in the root directory
dotenv.config({ path: process.cwd() + '/.env' });

import express from 'express';
import passport from 'passport';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Middleware Imports ---
import errorHandler from './middlewares/error.middleware.js';

// --- Route Imports ---
// Core Platform Routes
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import oauthRoutes from './routes/oauth.routes.js';
import calendarRoutes from './routes/calendar.routes.js';

// AI & Recommendation Routes
import aiRoutes from './routes/ai.routes.js';
import problemRoutes from './routes/problem.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';

// --- Passport Config ---
// ⚠️ TEMPORARILY DISABLED: Preventing crash due to missing GOOGLE_CLIENT_ID
// Uncomment these lines when you have added keys to your .env file
// import './config/google.passport.js';
// import './config/github.passport.js';

// Resolve paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const apilimiter = rateLimit({
  windowMs: 1000,
  max: 100, // Limit to 100 requests per second for dev
  message: 'Too many requests',
});

// Middleware: CORS
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

// Middleware: Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Auth & Security
app.use(passport.initialize());
app.use(apilimiter);

// Middleware: Static Files (Resolve 'public' relative to 'src')
app.use(express.static(path.join(__dirname, '../public')));

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/calendar', calendarRoutes);

// AI Feature Routes
app.use('/api/ai', aiRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Test Endpoint
app.get('/test', (req, res) => {
  res.send('API is working fine');
});

// Root Endpoint (Serve React/HTML frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;