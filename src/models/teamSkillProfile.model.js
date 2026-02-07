import mongoose from 'mongoose';

const teamSkillProfileSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      unique: true,
      index: true,
    },
    extractedSkills: {
      type: [String],
      required: true,
      default: [],
    },
    domains: {
      type: [String],
      required: true,
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
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
teamSkillProfileSchema.index({ teamId: 1 });
teamSkillProfileSchema.index({ lastUpdated: -1 });

const TeamSkillProfile = mongoose.model('TeamSkillProfile', teamSkillProfileSchema);

export default TeamSkillProfile;

