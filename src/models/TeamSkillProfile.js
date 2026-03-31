import mongoose from 'mongoose';

const teamSkillProfileSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    unique: true,
    index: true,
  },
  extractedSkills: {
    type: [String],
    default: [],
  },
  domains: {
    type: [String],
    default: [],
  },
  tools: {
    type: [String],
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const TeamSkillProfile = mongoose.model('TeamSkillProfile', teamSkillProfileSchema);
export default TeamSkillProfile;
