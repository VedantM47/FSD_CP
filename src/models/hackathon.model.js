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

    minTeamSize: {
      type: Number,
      default: 1, 
    },
    maxTeamSize: {
      type: Number,
      default: 4, 
    },

    prizePool: String,
    image: String, 
    rules: String,
    terms: String,

    status: {
      type: String,
      enum: ['draft', 'open', 'ongoing', 'closed'],
      default: 'draft',
    },

    // Isko 'judgeUserId' hi rakha hai kyunki assignJudge controller yahi maangta hai
    judges: [
      {
        judgeUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        assignedAt: Date,
      },
    ],

    // Isko wapas 'organizerUserId' kar diya hai taaki populate crash na ho
    organizers: [
      {
        organizerUserId: {
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