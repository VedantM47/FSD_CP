import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Start HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('🔒 HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('❌ Failed to start server');
    console.error(error);
    process.exit(1);
  }
};

startServer();