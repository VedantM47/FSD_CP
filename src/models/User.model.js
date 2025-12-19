import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: Number,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // never return password by default
    }, // hashed password

    // System-level role
    systemRole: {
      type: String,
      enum: ['user', 'admin', 'mentor'],
      default: 'user',
    },

    // Hackathon-specific roles
    hackathonRoles: [
      {
        hackathonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Hackathon',
        },
        role: {
          type: String,
          enum: ['participant', 'judge', 'organizer'],
        },
      },
    ],

    college: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    year: {
      type: Number,
    },

    skills: [
      {
        type: String,
      },
    ],

    github: String,
    linkedin: String,

    isVerified: {
      type: Boolean,
      default: false,
    },

    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;