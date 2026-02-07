import mongoose from 'mongoose';

const problemMetadataSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProblemStatement',
      required: true,
      unique: true,
      index: true,
    },
    domains: {
      type: [String],
      required: true,
      default: [],
    },
    requiredSkills: {
      type: [String],
      required: true,
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
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
problemMetadataSchema.index({ problemId: 1 });
problemMetadataSchema.index({ domains: 1 });
problemMetadataSchema.index({ difficulty: 1 });
problemMetadataSchema.index({ requiredSkills: 1 });

const ProblemMetadata = mongoose.model('ProblemMetadata', problemMetadataSchema);

export default ProblemMetadata;

