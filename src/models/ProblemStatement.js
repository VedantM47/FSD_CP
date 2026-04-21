import mongoose from 'mongoose';

const problemStatementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    default: 'platform',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProblemStatement = mongoose.model('ProblemStatement', problemStatementSchema);
export default ProblemStatement;
