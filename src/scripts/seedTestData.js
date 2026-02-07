// scripts/seedTestData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.model.js';
import Team from '../models/team.model.js';

dotenv.config();

const run = async () => {
  console.log('🔹 Starting seedTestData.js');
  console.log('MONGODB_URI:', process.env.MONGODB_URI || '(not set, using default)');

  await connectDB();

  console.log('🔹 Connected to MongoDB, clearing old test data...');

  // Clear old test data (optional, explicit list to avoid regex mismatch)
  const testEmails = [
    'test-team-1-frontend@example.com',
    'test-team-1-backend@example.com',
    'test-team-2-ml@example.com',
  ];
  await Team.deleteMany({});
  await User.deleteMany({ email: { $in: testEmails } });

  console.log('🔹 Inserting test users...');

  // Create some users with skills
  const users = await User.insertMany([
    {
      fullName: 'Frontend Dev 1',
      email: 'test-team-1-frontend@example.com',
      password: 'hashed',          // dummy
      skills: ['javascript', 'react', 'css', 'ui/ux'],
      department: 'CSE',
      college: 'Test College',
      github: 'https://github.com/frontend1'
    },
    {
      fullName: 'Backend Dev 1',
      email: 'test-team-1-backend@example.com',
      password: 'hashed',
      skills: ['node', 'express', 'mongodb', 'rest api'],
      department: 'CSE',
      college: 'Test College',
      github: 'https://github.com/backend1'
    },
    {
      fullName: 'ML Engineer',
      email: 'test-team-2-ml@example.com',
      password: 'hashed',
      skills: ['python', 'machine learning', 'pandas', 'numpy'],
      department: 'AI/ML',
      college: 'Test College',
      github: 'https://github.com/ml1'
    }
  ], { ordered: false });

  console.log('🔹 Users inserted:', users.map(u => u.email));

  // Create teams
  const [u1, u2, u3] = users;

  console.log('🔹 Creating teams...');

  const team1 = await Team.create({
    name: 'Test Frontend + Backend Team',
    hackathonId: new mongoose.Types.ObjectId(), // dummy
    leader: u1._id,
    members: [
      { userId: u1._id, status: 'accepted' },
      { userId: u2._id, status: 'accepted' }
    ],
    project: {
      title: 'E-commerce Web App',
      description: 'React frontend, Node.js + MongoDB backend, responsive UI.',
    }
  });

  const team2 = await Team.create({
    name: 'Test ML Team',
    hackathonId: new mongoose.Types.ObjectId(),
    leader: u3._id,
    members: [{ userId: u3._id, status: 'accepted' }],
    project: {
      title: 'Student Performance Predictor',
      description: 'Python ML model, data science, analytics dashboard.',
    }
  });

  console.log('✅ Seeded teams:');
  console.log('   Team 1 ID:', team1._id.toString());
  console.log('   Team 2 ID:', team2._id.toString());

  await mongoose.connection.close();
  console.log('🔹 Closed MongoDB connection. Done.');
};

run().catch(err => {
  console.error('❌ Error in seedTestData.js:', err);
  process.exit(1);
});