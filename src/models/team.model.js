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
          enum: ['pending', 'accepted', 'invited'],
          default: 'pending',
        },
        message: {
          type: String,
          trim: true,
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
    presentationSlot: {
      date: Date,
      startTime: String,
      endTime: String,
    },
  },
  { timestamps: true }
);

// Custom validation to prevent duplicate userId in members array
// NOTE: Must be defined BEFORE mongoose.model() call
teamSchema.pre('save', function(next) {
  const userIds = this.members.map(m => m.userId.toString());
  const uniqueIds = new Set(userIds);
  
  if (userIds.length !== uniqueIds.size) {
    return next(new Error('Duplicate user in team members'));
  }
  
});

// unique team name
teamSchema.index(
  { name: 1, hackathonId: 1 },
  { unique: true }
);

// text index for searching teams by name
teamSchema.index({ name: 'text' });

const Team = mongoose.model('Team', teamSchema);

export default Team;