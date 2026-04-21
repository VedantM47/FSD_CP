import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/user.model.js';
import Hackathon from './models/hackathon.model.js';
import Team from './models/team.model.js';
import OrganizerApplication from './models/organizerApplication.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Hackathon.deleteMany({});
    await Team.deleteMany({});
    await OrganizerApplication.deleteMany({});

    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      systemRole: 'admin',
      isVerified: true,
    });

    const judge = await User.create({
      fullName: 'Expert Judge',
      email: 'judge@example.com',
      password: hashedPassword,
      systemRole: 'judge',
      isVerified: true,
    });

    const participant1 = await User.create({
      fullName: 'Alice Developer',
      email: 'alice@example.com',
      password: hashedPassword,
      systemRole: 'user',
      college: 'Tech University',
      isVerified: true,
    });

    const participant2 = await User.create({
      fullName: 'Bob Hacker',
      email: 'bob@example.com',
      password: hashedPassword,
      systemRole: 'user',
      college: 'State College',
      isVerified: true,
    });

    const participant3 = await User.create({
      fullName: 'Charlie Coder',
      email: 'charlie@example.com',
      password: hashedPassword,
      systemRole: 'user',
      college: 'Global Institute',
      isVerified: true,
    });

    console.log('Creating hackathons...');
    const now = new Date();
    
    // Future Open Hackathon
    const openHackathon = await Hackathon.create({
      title: 'Global AI Innovators Challenge',
      description: 'Build the next generation of AI-powered applications. Join thousands of developers worldwide to solve real global problems.',
      status: 'open',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // starts in 7 days
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // deadline in 5 days
      minTeamSize: 1,
      maxTeamSize: 4,
      prizePool: '$10,000',
      rules: '1. Code must be written during the hackathon. 2. Use open-source libraries.',
      terms: 'Standard hackathon terms apply.',
      createdBy: admin._id,
      judges: [{ judgeUserId: judge._id, assignedAt: now }]
    });

    // Currently Ongoing Hackathon
    const ongoingHackathon = await Hackathon.create({
      title: 'Cybersecurity AppSec 2026',
      description: 'Find vulnerabilities and patch them! A 48-hour intense security challenge.',
      status: 'ongoing',
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // started 1 day ago
      endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // ends in 1 day
      registrationDeadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // deadline passed
      minTeamSize: 2,
      maxTeamSize: 5,
      prizePool: '$5,000 + Swag',
      rules: 'Capture the flag rules apply.',
      terms: 'Do not attack infrastructure. Target only the provided boxes.',
      createdBy: admin._id,
      judges: [{ judgeUserId: judge._id, assignedAt: now }]
    });

    // Past Closed Hackathon
    const closedHackathon = await Hackathon.create({
      title: 'FinTech Revolution 2025',
      description: 'The biggest regional FinTech hackathon that happened last year.',
      status: 'closed',
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 
      endDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000),
      minTeamSize: 1,
      maxTeamSize: 4,
      prizePool: '$15,000',
      createdBy: admin._id,
      judges: [{ judgeUserId: judge._id, assignedAt: now }]
    });

    // Draft Hackathon
    await Hackathon.create({
      title: 'Web3 & Blockchain Summit',
      description: 'Draft hackathon, not yet open to the public.',
      status: 'draft',
      startDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 63 * 24 * 60 * 60 * 1000),
      minTeamSize: 1,
      maxTeamSize: 4,
      prizePool: 'TBD',
      createdBy: admin._id,
    });

    // Give judge the role
    judge.hackathonRoles.push({ hackathonId: openHackathon._id, role: 'judge' });
    judge.hackathonRoles.push({ hackathonId: ongoingHackathon._id, role: 'judge' });
    judge.hackathonRoles.push({ hackathonId: closedHackathon._id, role: 'judge' });
    await judge.save();

    console.log('Creating teams and registrations...');

    // Team 1 in Open Hackathon (Alice + Bob)
    const team1 = await Team.create({
      name: 'AI Wizards',
      hackathonId: openHackathon._id,
      leader: participant1._id,
      members: [{ userId: participant1._id, status: 'accepted' }],
      status: 'active',
      joinCode: 'AIWIZ123'
    });

    participant1.hackathonRoles.push({ hackathonId: openHackathon._id, role: 'participant' });
    participant1.teams.push(team1._id);
    await participant1.save();

    // Bob joins Team 1
    team1.members.push({ userId: participant2._id, status: 'accepted' });
    await team1.save();
    participant2.hackathonRoles.push({ hackathonId: openHackathon._id, role: 'participant' });
    participant2.teams.push(team1._id);
    await participant2.save();

    // Charlie applies to Team 1 but is pending
    team1.members.push({ userId: participant3._id, status: 'pending' });
    await team1.save();

    // Pending Organizer Application
    console.log('Creating organizer applications...');
    await OrganizerApplication.create({
      userId: participant1._id,
      motivation: 'I lead the university tech club and would love to help run future hackathons.',
      status: 'pending'
    });

    console.log('========== Seed Database Completed ==========');
    console.log('Login credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('Judge: judge@example.com / password123');
    console.log('User 1: alice@example.com / password123');
    console.log('User 2: bob@example.com / password123');
    console.log('User 3: charlie@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
