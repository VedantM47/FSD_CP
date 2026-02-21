import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: '.env' }); // 👈 Load from src folder

import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
