import 'dotenv/config'; 
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import from src
import app from './src/app.js';
import connectDB from './src/config/database.js';
import socketAuth from './src/middlewares/socketAuth.middleware.js'; 
import chatHandler from './src/socket/chat.handler.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP Server for Socket.io
    const httpServer = createServer(app);

    // Initialize Socket.io
    const io = new Server(httpServer, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    });

    io.use(socketAuth);
    
    io.on('connection', (socket) => {
      console.log(`Socket Connected: ${socket.id}`);
      chatHandler(io, socket);
      socket.on('disconnect', () => console.log('Socket Disconnected'));
    });

    // Start Server
    const server = httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
    });

    // Graceful Shutdown
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
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();