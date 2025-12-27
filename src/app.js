import express from 'express';
import errorHandler from './middlewares/error.middleware.js';
import userRoutes from './routes/user.routes.js';
import teamRoutes from './routes/team.routes.js';
import hackathonRoutes from './routes/hackathon.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// Middleware to parse JSON requests
app.use(express.json());


// User Routes
app.use('/api/users', userRoutes);
// Team Routes
app.use('/api/teams', teamRoutes);
// Hackathon Routes
app.use('/api/hackathons', hackathonRoutes);
// Calendar Routes
app.use('/api/calendar', calendarRoutes);
// Notification Routes
app.use('/api/notifications', notificationRoutes);

// Test Route
app.get('/test', (req, res) => {
  res.send('API is working fine');
});


// Global Error Handling Middleware
app.use(errorHandler);

export default app;