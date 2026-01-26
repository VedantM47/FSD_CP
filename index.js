import 'dotenv/config'; 
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import socketAuth from './src/middlewares/socketAuth.middleware.js';
import chatHandler from './src/socket/chat.handler.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP Server explicitly to attach Socket.io
    const httpServer = createServer(app);

    // Initialize Socket.io with CORS settings
    const io = new Server(httpServer, {
      cors: {
        origin: "*", 
        methods: ["GET", "POST"]
      }
    });

    // Apply Socket Authentication Middleware
    io.use(socketAuth);

    // Handle Socket Connections
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.fullName}`);
      
      // Attach Chat Event Listeners
      chatHandler(io, socket);

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    // Start Server
    const server = httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful Shutdown Logic
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down...`);
      io.close(); 
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();