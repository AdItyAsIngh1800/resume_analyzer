import { GoogleGenAI, Type } from '@google/genai';

const MODEL = 'gemini-2.5-flash';
const ai = new GoogleGenAI({}); // reads GEMINI_API_KEY from env automatically

// ── JSON Schemas ────────────────────────────────────────────────────────

const skillsSchema = {
  type: Type.OBJECT,
  properties: {
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: {
            type: Type.STRING,
            description: 'Must be one of: programming_language, framework, database, cloud, devops, soft_skill, tool, methodology, other',
          },
          proficiency: {
            type: Type.STRING,
            description: 'Must be one of: beginner, intermediate, advanced, expert',
          },
          yearsOfExperience: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'category', 'proficiency'],
      },
    },
  },
  required: ['skills'],
};

const atsSchema = {
  type: Type.OBJECT,
  properties: {
    atsScore: { type: Type.INTEGER, description: 'Score from 0 to 100' },
    atsFeedback: { type: Type.STRING },
    improvements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          area: { type: Type.STRING },
          suggestion: { type: Type.STRING },
          impact: { type: Type.STRING, description: 'Must be one of: low, medium, high' },
        },
        required: ['area', 'suggestion', 'impact'],
      },
    },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    overallSummary: { type: Type.STRING },
  },
  required: ['atsScore', 'atsFeedback', 'improvements', 'strengths', 'weaknesses', 'overallSummary'],
};

const missingSkillsSchema = {
  type: Type.OBJECT,
  properties: {
    missingSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          importance: {
            type: Type.STRING,
            description: 'Must be one of: nice_to_have, recommended, critical',
          },
          reason: { type: Type.STRING },
        },
        required: ['name', 'category', 'importance', 'reason'],
      },
    },
  },
  required: ['missingSkills'],
};

// ── Prompts ─────────────────────────────────────────────────────────────

const SKILL_EXTRACTION_PROMPT = `You are an expert resume analyst and technical recruiter.

Analyze the following resume text and extract ALL technical and soft skills mentioned.

For each skill:
- Determine the most appropriate category
- Estimate proficiency based on context clues (years mentioned, project complexity, role seniority)
- If years of experience are explicitly mentioned, include them; otherwise omit or set to null

Be thorough — include skills implied by tools, frameworks, methodologies, and job responsibilities.

Resume text:
---
{RESUME_TEXT}
---`;

const ATS_SCORING_PROMPT = `You are an expert ATS (Applicant Tracking System) analyst.

Score the following resume on a scale of 0–100 for ATS compatibility and overall quality.

Consider these factors:
1. **Formatting** (20 pts): Clear sections, consistent formatting, parseable structure
2. **Keywords** (25 pts): Industry-relevant keywords, technical terms, action verbs
3. **Experience** (25 pts): Quantified achievements, clear responsibilities, progression
4. **Education & Certs** (15 pts): Relevant education, certifications, continuous learning
5. **Overall Presentation** (15 pts): Professional summary, contact info, appropriate length

Provide:
- A numeric score (0–100)
- Detailed feedback explaining the score
- Specific, actionable improvements ranked by impact (high/medium/low)
- Top 3 strengths of the resume
- Top 3 weaknesses or areas for improvement
- A brief overall summary (2–3 sentences)

Resume text:
---
{RESUME_TEXT}
---`;

const MISSING_SKILLS_PROMPT = `You are a career advisor and technical recruiter specializing in tech industry hiring.

Based on the resume below, identify skills that are MISSING but would significantly strengthen this candidate's profile.

Consider:
1. Skills commonly expected for someone at this level and role
2. Complementary technologies to what they already know
3. In-demand skills in the current job market (2024–2025)
4. Skills that would help them advance to the next level

For each missing skill:
- Name the specific skill or technology
- Categorize it
- Rate its importance: critical (must-have for their target role), recommended (would significantly help), nice_to_have (would differentiate them)
- Explain WHY this skill would benefit them specifically

Focus on the most impactful 8–12 missing skills. Don't suggest skills they clearly already have.

Resume text:
---
{RESUME_TEXT}
---`;

// ── Service Functions ───────────────────────────────────────────────────

/**
 * Task #11 — Extract skills from resume text via Gemini.
 */
export async function extractSkills(resumeText) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: SKILL_EXTRACTION_PROMPT.replace('{RESUME_TEXT}', resumeText),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: skillsSchema,
    },
  });

  return JSON.parse(response.text);
}

/**
 * Task #12 — Score resume for ATS compatibility via Gemini.
 */
export async function scoreATS(resumeText) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: ATS_SCORING_PROMPT.replace('{RESUME_TEXT}', resumeText),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: atsSchema,
    },
  });

  return JSON.parse(response.text);
}

/**
 * Task #13 — Identify missing skills via Gemini.
 */
export async function analyzeMissingSkills(resumeText) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: MISSING_SKILLS_PROMPT.replace('{RESUME_TEXT}', resumeText),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: missingSkillsSchema,
    },
  });

  return JSON.parse(response.text);
}

/**
 * Run all three analyses in parallel and return a merged result object.
 */
export async function analyzeResume(resumeText) {
  const start = Date.now();

  const [skillsResult, atsResult, missingResult] = await Promise.all([
    extractSkills(resumeText),
    scoreATS(resumeText),
    analyzeMissingSkills(resumeText),
  ]);

  const processingTimeMs = Date.now() - start;

  return {
    skills: skillsResult.skills,
    atsScore: atsResult.atsScore,
    atsFeedback: atsResult.atsFeedback,
    improvements: atsResult.improvements,
    strengths: atsResult.strengths,
    weaknesses: atsResult.weaknesses,
    overallSummary: atsResult.overallSummary,
    missingSkills: missingResult.missingSkills,
    modelUsed: MODEL,
    processingTimeMs,
  };
}
