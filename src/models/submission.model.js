import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectDetails: {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
      },
      pptLink: {
        type: String,
        required: true, 
        trim: true,
      },
      repoLink: {
        type: String,
        trim: true,
      },
      demoLink: {
        type: String,
        trim: true,
      },
    },
    track: {
      type: String,
      required: true,
    },
    round: {
      type: String,
      enum: ['Round 1', 'Round 2', 'Finals'],
      default: 'Round 1',
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'graded', 'rejected'],
      default: 'submitted',
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    judgesComments: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

submissionSchema.index({ hackathonId: 1, teamId: 1, round: 1 }, { unique: true });
submissionSchema.index({ hackathonId: 1, track: 1 });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;