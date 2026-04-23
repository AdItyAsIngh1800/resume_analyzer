export interface User {
  _id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
  analysisCount: number;
}

export interface Resume {
  _id: string;
  fileName: string;
  fileSize: number;
  status: 'uploaded' | 'analyzed' | 'error';
  errorMessage?: string;
  createdAt: string;
}

export interface Skill {
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Improvement {
  area: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

export interface MissingSkill {
  name: string;
  importance: 'critical' | 'recommended' | 'nice-to-have';
  reason: string;
}

export interface Analysis {
  _id: string;
  resumeId: string;
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skills: Skill[];
  improvements: Improvement[];
  missingSkills: MissingSkill[];
  processingTimeMs?: number;
  createdAt: string;
}

export interface JobMatch {
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    workModel: string;
    type: string;
    level: string;
    requiredSkills: string[];
    niceToHaveSkills: string[];
    salaryRange?: { min: number; max: number; currency: string };
    description?: string;
  };
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}
