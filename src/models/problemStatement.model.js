import mongoose from 'mongoose';

const problemStatementSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['platform', 'SIH', 'external'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
problemStatementSchema.index({ source: 1, createdAt: -1 });

const ProblemStatement = mongoose.model('ProblemStatement', problemStatementSchema);

export default ProblemStatement;

