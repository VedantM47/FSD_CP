// team.model.js
const mongoose = require('mongoose');

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
    }, // leader is also a member of team and the user who creates the team is leader by default. (in future we can add functionality to change leader also)

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
        },// the ability to accept or reject user in team will be with team leader only.
      },
    ],

    maxSize: {
      type: Number,
    }, // we can set max team size based on the hackathon in which they are participating.

    isOpenToJoin: {
      type: Boolean,
      default: true,
    }, // if true then other users can send join requests to team else they cannot, this status is publicaly visible to all other user in hackathon.

    isLocked: {
      type: Boolean,
      default: false,
    }, // if true then no changes can be made to team like adding/removing members or changing team name etc. this will be set true when hackathon status is onging or completed.

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

module.exports = mongoose.model('Team', teamSchema);