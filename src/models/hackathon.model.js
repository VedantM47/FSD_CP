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

    maxTeamSize: Number,

    prizePool: String,

    rules: String,
    terms: String,

    status: {
      type: String,
      enum: ['draft', 'open', 'ongoing', 'closed'],
      default: 'draft',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Hackathon = mongoose.model('Hackathon', hackathonSchema);
export default Hackathon;