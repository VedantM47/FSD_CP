import 'dotenv/config'; 
import { createServer } from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import connectDB from './config/database.js'; 
import socketAuth from './middlewares/socketAuth.middleware.js'; 

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Create HTTP Server explicitly to attach Socket.io
    const httpServer = createServer(app);

    // 3. Initialize Socket.io with CORS settings
    const io = new Server(httpServer, {
      cors: {
        origin: "*", 
        methods: ["GET", "POST"]
      }
    });

    // 4. Apply Socket Authentication Middleware
    io.use(socketAuth);

    // 5. Handle Socket Connections
    io.on('connection', (socket) => {
      // console.log(`User connected: ${socket.user.fullName}`);
      console.log(`Socket connected: ${socket.id}`);
      
      // Attach Chat Event Listeners
      // chatHandler(io, socket);

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    // 6. Start Server
    const server = httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
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