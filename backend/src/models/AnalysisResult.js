import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'programming_language',
        'framework',
        'database',
        'cloud',
        'devops',
        'soft_skill',
        'tool',
        'methodology',
        'other',
      ],
      default: 'other',
    },
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
    yearsOfExperience: { type: Number, default: null },
  },
  { _id: false }
);

const improvementSchema = new mongoose.Schema(
  {
    area: { type: String, required: true },
    suggestion: { type: String, required: true },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { _id: false }
);

const missingSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: 'other' },
    importance: {
      type: String,
      enum: ['nice_to_have', 'recommended', 'critical'],
      default: 'recommended',
    },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const analysisResultSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Skill extraction (Task #11)
    skills: [skillSchema],

    // ATS scoring (Task #12)
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    atsFeedback: {
      type: String,
      default: '',
    },
    improvements: [improvementSchema],

    // Missing skills (Task #13)
    missingSkills: [missingSkillSchema],

    // Summary
    overallSummary: {
      type: String,
      default: '',
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],

    // Metadata
    modelUsed: {
      type: String,
      default: 'gemini-2.5-flash',
    },
    processingTimeMs: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

analysisResultSchema.index({ userId: 1, createdAt: -1 });
analysisResultSchema.index({ resumeId: 1 }, { unique: true });

export default mongoose.model('AnalysisResult', analysisResultSchema);
