import express from 'express';
import errorHandler from './middlewares/error.middleware.js';
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';
import sumbissionRoutes from './routes/submission.routes.js';
import rateLimit from 'express-rate-limit';

const app = express();
const apilimiter = rateLimit({
    window:1000,
    max:5,
    message:"Too many Request"
});

// Middleware to parse JSON requests
app.use(express.json());
// Middleware to add ratelimtter
app.use(apilimiter);

// User Routes
app.use('/api/users', userRoutes);
// Team Routes
app.use('/api/teams', teamRoutes);
// Hackathon Routes
app.use('/api/hackathons', hackathonRoutes);
//Submission Routes
app.use('/api/submissions',sumbissionRoutes);
// Test Route
app.get('/test',(req, res) => {
  res.send('API is working fine');
});


// Global Error Handling Middleware
app.use(errorHandler);

export default app;