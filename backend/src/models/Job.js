import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    workModel: {
      type: String,
      enum: ['remote', 'hybrid', 'on-site'],
      default: 'remote',
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
      default: 'full-time',
    },
    level: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'lead', 'staff', 'director', 'any'],
      default: 'mid',
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    niceToHaveSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
    },
    url: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for fast searching and matching
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ level: 1 });

export default mongoose.model('Job', jobSchema);
