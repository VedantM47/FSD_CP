import mongoose from 'mongoose';

const problemMetadataSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  domains: {
    type: [String],
    default: [],
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  keywords: {
    type: [String],
    default: [],
  },
  tools: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProblemMetadata = mongoose.model('ProblemMetadata', problemMetadataSchema);
export default ProblemMetadata;
