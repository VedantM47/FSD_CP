import 'dotenv/config'; // 👈 THIS RUNS FIRST, INJECTING THE .ENV IMMEDIATELY

import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// 👇 NOW THESE RUN, AND PROCESS.ENV IS FULLY LOADED!
import app from './src/app.js';
import connectDB from './src/config/db.js';
import socketAuth from './src/middlewares/socketAuth.middleware.js';
import chatHandler from './src/socket/chat.handler.js';
import { initSocket } from './src/utils/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();

    // Create an explicit HTTP server so Socket.IO can share it with Express
    const httpServer = createServer(app);

    // Initialize Socket.IO using the helper so getIO() works elsewhere
    const io = initSocket(httpServer, process.env.ALLOWED_ORIGIN || 'http://localhost:5173');

    io.use(socketAuth);
    
    io.on('connection', (socket) => {
      chatHandler(io, socket);
    });

    // Start Server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO attached and listening`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down...`);
      io.close(); 
      httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();