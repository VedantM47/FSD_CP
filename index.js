import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.', '.env') }); // 👈 Load from src/.env

import app from './src/app.js';
import connectDB from './src/config/db.js';
import { initSocket } from './src/utils/socket.js';

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();

    // Create an explicit HTTP server so Socket.IO can share it with Express
    const httpServer = createServer(app);

    // Initialise Socket.IO
    initSocket(httpServer, process.env.ALLOWED_ORIGIN || 'http://localhost:5173');

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 Socket.IO attached and listening`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
