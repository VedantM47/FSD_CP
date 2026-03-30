import mongoose from 'mongoose';

const recommendationResultSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  matchScore: {
    type: Number,
    required: true,
  },
  rankPosition: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RecommendationResult = mongoose.model('RecommendationResult', recommendationResultSchema);
export default RecommendationResult;
