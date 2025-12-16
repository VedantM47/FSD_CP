import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ systemRole: 'admin' });
    if (adminExists) {
      console.log('⚠️ Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@12345', 12);

    await User.create({
      fullName: 'System Admin',
      email: 'admin@hackathon.com',
      password: hashedPassword,
      systemRole: 'admin',
      isVerified: true,
    });

    console.log('✅ Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin seed failed:', error.message);
    process.exit(1);
  }
};

createAdmin();