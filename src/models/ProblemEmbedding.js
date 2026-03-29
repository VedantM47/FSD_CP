import mongoose from 'mongoose';

const problemEmbeddingSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true,
    index: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  embeddingModel: {
    type: String,
    default: 'tfidf',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProblemEmbedding = mongoose.model('ProblemEmbedding', problemEmbeddingSchema);
export default ProblemEmbedding;
