import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussion', 
      default: null, 
      index: true, 
    },
    type: {
      type: String,
      enum: ['text', 'announcement'],
      default: 'text',
    },
  },
  { timestamps: true }
);

const Discussion = mongoose.model('Discussion', discussionSchema);
export default Discussion;