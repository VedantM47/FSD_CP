import mongoose from 'mongoose';

const problemEmbeddingSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProblemStatement',
      required: true,
      unique: true,
      index: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    embeddingModel: {
      type: String,
      default: 'default',
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

// Index for faster queries
problemEmbeddingSchema.index({ problemId: 1 });

const ProblemEmbedding = mongoose.model('ProblemEmbedding', problemEmbeddingSchema);

export default ProblemEmbedding;

