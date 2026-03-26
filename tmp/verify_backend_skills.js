import mongoose from 'mongoose';
import Team from '../src/models/team.model.js';
import User from '../src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const team = await Team.findOne().populate('leader').populate('members.userId');
    if (!team) {
      console.log('No teams found to verify');
      process.exit(0);
    }

    const teamObj = team.toObject();
    const skills = new Set();
    teamObj.members
      .filter((m) => m.status === "accepted")
      .forEach((m) => {
        if (m.userId?.skills) {
          m.userId.skills.forEach((s) => skills.add(s));
        }
      });
    if (teamObj.leader?.skills) {
      teamObj.leader.skills.forEach((s) => skills.add(s));
    }
    teamObj.teamSkills = Array.from(skills);

    console.log(`Team: ${teamObj.name}`);
    console.log(`Team Skills: ${teamObj.teamSkills.join(', ')}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// verify(); // Uncomment to run if needed
