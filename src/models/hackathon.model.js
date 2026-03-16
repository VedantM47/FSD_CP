// src/models/hackathon.model.js
import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    startDate: Date,
    endDate: Date,

    registrationDeadline: Date,
    prototypeDeadline: Date,
    finalDeadline: Date,
    presentationDate: Date,
    resultDate: Date,

    // FIX: Adding Minimum and Defaulting Maximum
    minTeamSize: {
      type: Number,
      default: 1, // Default 1 member (Solo allowed)
    },
    maxTeamSize: {
      type: Number,
      default: 4, 
    },

    prizePool: String,
    rules: String,
    terms: String,

    status: {
      type: String,
      enum: ['draft', 'open', 'ongoing', 'closed'],
      default: 'draft',
    },

    judges: [
      {
        judgeUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        assignedAt: Date,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Hackathon = mongoose.model('Hackathon', hackathonSchema);
export default Hackathon;