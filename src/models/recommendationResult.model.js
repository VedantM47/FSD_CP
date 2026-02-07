import mongoose from 'mongoose';

const recommendationResultSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProblemStatement',
      required: true,
      index: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    rankPosition: {
      type: Number,
      required: true,
      min: 1,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate recommendations
recommendationResultSchema.index({ teamId: 1, problemId: 1 }, { unique: true });
// Index for faster queries
recommendationResultSchema.index({ teamId: 1, rankPosition: 1 });
recommendationResultSchema.index({ teamId: 1, matchScore: -1 });

const RecommendationResult = mongoose.model('RecommendationResult', recommendationResultSchema);

export default RecommendationResult;

