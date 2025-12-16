// User.model.js
const mongoose = require('mongoose');

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
    }, // here saving a hashed password for security reasons

    // role: {
    //   type: String,
    //   enum: ['student', 'judge', 'admin', 'faculty'],
    //   default: 'student',
    // }, // only admin has the right to change the users role in system form student to other and admin user is created at a time of development.


    // System-level role
    systemRole: {
      type: String,
      enum: ['user', 'admin', 'faculty'],
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
    }, // we can use defaulat VIT pune here but i think it would be better if we did it from frontend side.

    department: {
      type: String,
      trim: true,
    }, // we can create option menu at frontend side for consistency.

    year: {
      type: Number, // taking input as fy sy ty final like that and translating it into numbers then inserting it in db also that will handle from the frontend side.
    },

    skills: [{
      type: String,
    }],

    github: String,  // take url which is valid we have check the url by hit its header if 200 only then we insert it in db.
    linkedin: String,// do same thing as above.

    isVerified: {
      type: Boolean,
      default: false,
    }, // keeping defalut as false and only user.role==faculty has rights to chanaged it to true.

    teams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    }],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);