import express from 'express';
import userRoutes from './routes/user.routes.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

// Middleware to parse JSON requests
app.use(express.json());


// User Routes
app.use('/api/users', userRoutes);


// Test Route
app.get('/test',(req, res) => {
  res.send('API is working fine');
});


// Global Error Handling Middleware
app.use(errorHandler);

export default app;