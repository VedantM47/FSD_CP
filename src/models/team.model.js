import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['pending', 'accepted'],
          default: 'pending',
        },
      },
    ],

    maxSize: {
      type: Number,
    },

    isOpenToJoin: {
      type: Boolean,
      default: true,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    project: {
      title: String,
      description: String,
      repoUrl: String,
      demoUrl: String,
      driveUrl: String,
      submittedAt: Date,
    },
  },
  { timestamps: true }
);

const Team = mongoose.model('Team', teamSchema);
export default Team;