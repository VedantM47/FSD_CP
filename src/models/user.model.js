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
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
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
        hId: {
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

    notificationPreferences: {
      email: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      invites: { type: Boolean, default: true },
      results: { type: Boolean, default: true }
    },

    privacySettings: {
      publicProfile: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true },
      allowInvites: { type: Boolean, default: true }
    },

    department: {
      type: String,
      trim: true,
    },

    major: {
      type: String,
      trim: true,
    },

    year: {
      type: Number,
    },

    bio: { type: String, trim: true },
    dateOfBirth: { type: Date },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer Not to Say'] },
    degree: { type: String, trim: true },
    graduationYear: { type: Number },
    interests: [{ type: String }],
    resumeUrl: { type: String },
    website: { type: String, trim: true },
    collegeState: { type: String, trim: true },
    collegeCity: { type: String, trim: true },

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