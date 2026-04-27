import { GoogleGenAI, Type } from '@google/genai';

// gemini-2.5-flash-lite: higher free-tier daily quota (~1000 RPD) vs
// gemini-2.5-flash's 20 RPD — better suited for dev/portfolio use.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const ai = new GoogleGenAI({}); // reads GEMINI_API_KEY from env automatically

// ── Rate limiter: 5 requests per 60s, sliding window ─────────────────────
// Gemini free-tier quota is 5 RPM. We serialize requests through a queue
// that waits until a slot frees up before dispatching the next call.

const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;
const recentCalls = []; // timestamps of dispatched calls within the window
let queueTail = Promise.resolve();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireSlot() {
  while (true) {
    const now = Date.now();
    while (recentCalls.length && now - recentCalls[0] >= WINDOW_MS) {
      recentCalls.shift();
    }
    if (recentCalls.length < RATE_LIMIT) {
      recentCalls.push(now);
      return;
    }
    const waitMs = WINDOW_MS - (now - recentCalls[0]) + 50;
    await sleep(waitMs);
  }
}

/**
 * Serialize slot acquisition so concurrent callers don't all grab the same
 * capacity at once, then run the underlying Gemini call.
 *
 * Retries on transient upstream errors (503 UNAVAILABLE, 429, 500) with
 * exponential backoff. Each retry re-acquires a rate-limit slot.
 */
const MAX_ATTEMPTS = 4;

function isTransient(err) {
  const msg = String(err?.message || err || '');
  return /\b(503|429|500|UNAVAILABLE|RESOURCE_EXHAUSTED|INTERNAL)\b/i.test(msg);
}

async function callGemini(request) {
  let lastErr;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await new Promise((resolve) => {
      const prev = queueTail;
      queueTail = prev.then(async () => {
        await acquireSlot();
        resolve();
      }, async () => {
        await acquireSlot();
        resolve();
      });
    });

    try {
      return await ai.models.generateContent(request);
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === MAX_ATTEMPTS - 1) break;
      const backoffMs = 1000 * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
      await sleep(backoffMs);
    }
  }
  throw lastErr;
}

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
  const response = await callGemini({
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
  const response = await callGemini({
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
  const response = await callGemini({
    model: MODEL,
    contents: MISSING_SKILLS_PROMPT.replace('{RESUME_TEXT}', resumeText),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: missingSkillsSchema,
    },
  });

  return JSON.parse(response.text);
}

// ── Combined single-call analysis ───────────────────────────────────────
// The free-tier daily quota for gemini-2.5-flash is 20 requests/day. Running
// 3 calls per analysis burned the quota after ~6 resumes. A single combined
// call triples effective capacity and cuts latency roughly in half.

const combinedSchema = {
  type: Type.OBJECT,
  properties: {
    skills: skillsSchema.properties.skills,
    atsScore: atsSchema.properties.atsScore,
    atsFeedback: atsSchema.properties.atsFeedback,
    improvements: atsSchema.properties.improvements,
    strengths: atsSchema.properties.strengths,
    weaknesses: atsSchema.properties.weaknesses,
    overallSummary: atsSchema.properties.overallSummary,
    missingSkills: missingSkillsSchema.properties.missingSkills,
  },
  required: [
    'skills', 'atsScore', 'atsFeedback', 'improvements',
    'strengths', 'weaknesses', 'overallSummary', 'missingSkills',
  ],
};

const COMBINED_PROMPT = `You are an expert resume analyst, ATS specialist, and technical recruiter.

Produce a single JSON object with ALL of the following analyses of the resume below.

1. **skills** — Extract ALL technical and soft skills. For each: name, category (programming_language, framework, database, cloud, devops, soft_skill, tool, methodology, other), proficiency (beginner, intermediate, advanced, expert) inferred from context, and yearsOfExperience if explicitly stated (else null). Be thorough; include skills implied by tools/frameworks/responsibilities.

2. **atsScore** (0–100), **atsFeedback**, **improvements**, **strengths**, **weaknesses**, **overallSummary** — Score ATS compatibility weighing: formatting (20), keywords (25), experience with quantified achievements (25), education & certs (15), overall presentation (15). Provide detailed feedback, 3–5 ranked improvements (area, suggestion, impact: low/medium/high), top 3 strengths, top 3 weaknesses, and a 2–3 sentence overall summary.

3. **missingSkills** — Identify 8–12 skills that are MISSING but would strengthen this candidate for their target role, considering level-appropriate expectations, complementary technologies, and current (2024–2025) market demand. For each: name, category, importance (critical/recommended/nice_to_have), and a reason explaining WHY it benefits them specifically. Do not suggest skills they already have.

Resume text:
---
{RESUME_TEXT}
---`;

/**
 * Run all analyses in a single Gemini call and return a merged result.
 */
export async function analyzeResume(resumeText) {
  const start = Date.now();

  const response = await callGemini({
    model: MODEL,
    contents: COMBINED_PROMPT.replace('{RESUME_TEXT}', resumeText),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: combinedSchema,
    },
  });

  const result = JSON.parse(response.text);
  const processingTimeMs = Date.now() - start;

  return {
    skills: result.skills,
    atsScore: result.atsScore,
    atsFeedback: result.atsFeedback,
    improvements: result.improvements,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    overallSummary: result.overallSummary,
    missingSkills: result.missingSkills,
    modelUsed: MODEL,
    processingTimeMs,
  };
}
