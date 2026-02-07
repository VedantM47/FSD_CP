import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
  {
    /* ================= CORE RELATIONS ================= */

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
      index: true,
    },

    judgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /* ================= ROUND INFO ================= */

    round: {
      type: String,
      enum: ['round1', 'round2', 'final'],
      default: 'final',
    },

    roundIndex: {
      type: Number,
      default: 1, // useful if rounds are dynamic
    },

    /* ================= CRITERIA-BASED SCORING ================= */

    criteriaScores: {
      innovation: {
        score: { type: Number, min: 0, max: 10 },
        weight: { type: Number, default: 1 },
      },
      technicalImplementation: {
        score: { type: Number, min: 0, max: 10 },
        weight: { type: Number, default: 1 },
      },
      problemRelevance: {
        score: { type: Number, min: 0, max: 10 },
        weight: { type: Number, default: 1 },
      },
      presentation: {
        score: { type: Number, min: 0, max: 10 },
        weight: { type: Number, default: 1 },
      },
      feasibility: {
        score: { type: Number, min: 0, max: 10 },
        weight: { type: Number, default: 1 },
      },
    },

    /* ================= AGGREGATED SCORES ================= */

    totalScore: {
      type: Number,
      required: true,
    },

    normalizedScore: {
      type: Number, // optional (for judge bias correction later)
    },

    /* ================= JUDGE FEEDBACK ================= */

    remarks: {
      type: String,
      trim: true,
    },

    strengths: {
      type: String,
      trim: true,
    },

    improvements: {
      type: String,
      trim: true,
    },

    /* ================= STATUS & CONTROL ================= */

    status: {
      type: String,
      enum: ['draft', 'submitted', 'locked'],
      default: 'submitted',
    },

    isFinal: {
      type: Boolean,
      default: false,
    },

    /* ================= AUDIT METADATA ================= */

    evaluatedAt: {
      type: Date,
      default: Date.now,
    },

    lastUpdatedAt: {
      type: Date,
    },

    evaluatedByRole: {
      type: String,
      enum: ['judge', 'admin', 'faculty'],
      default: 'judge',
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */

// Prevent duplicate evaluation per judge per round per team
evaluationSchema.index(
  { hackathonId: 1, teamId: 1, judgeId: 1, round: 1 },
  { unique: true }
);

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;