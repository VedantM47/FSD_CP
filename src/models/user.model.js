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

    /*
     * FIX: Changed from Number to String.
     * Phone numbers can start with '+' or '0' and need trim — Number doesn't support trim.
     */
    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      select: false, // never return password by default
    },

    /*
     * System-level role.
     * FIX: Added 'judge' to the enum so that systemRole-based judge queries work correctly.
     * Previously 'judge' was missing here, causing getAllJudges to always return 0 results.
     */
    systemRole: {
      type: String,
      enum: ['user', 'admin', 'mentor', 'judge'],
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

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },

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

    /*
     * FIX: Removed the manual `createdAt` field.
     * Since `timestamps: true` is set below, Mongoose automatically manages
     * both `createdAt` and `updatedAt`. Having both caused a conflict.
     */
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  }
);

// Full-text search index on name and email
userSchema.index({ fullName: 'text', email: 'text' });

const User = mongoose.model('User', userSchema);
export default User;