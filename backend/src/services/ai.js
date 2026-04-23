// ── AI Service — Ollama (Local Model) ──────────────────────────────────
// Replaces Gemini API with a locally-running Ollama model.
// Zero rate limits, no API keys, fully offline-capable.
//
// Prerequisites:
//   brew install ollama
//   brew services start ollama
//   ollama pull llama3.1:8b
//
// Override model via OLLAMA_MODEL env var.

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

// ── Concurrency mutex ──────────────────────────────────────────────────
// Local models are single-threaded; serialize requests to avoid overload.
let queueTail = Promise.resolve();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Retry + call helper ────────────────────────────────────────────────
const MAX_ATTEMPTS = 3;

function isTransient(err) {
  const msg = String(err?.message || err || '');
  return /\b(ECONNREFUSED|ECONNRESET|ETIMEDOUT|socket hang up|fetch failed|503|500)\b/i.test(msg);
}

async function callOllama(prompt, systemPrompt) {
  let lastErr;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Serialize through the mutex
    await new Promise((resolve) => {
      const prev = queueTail;
      queueTail = prev.then(() => resolve(), () => resolve());
    });

    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          format: 'json',
          stream: false,
          options: {
            temperature: 0.3,       // lower for more consistent structured output
            num_predict: 16384,     // large enough for full combined analysis response
          },
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Ollama HTTP ${response.status}: ${body}`);
      }

      const data = await response.json();
      const text = data.message?.content || '';

      if (!text.trim()) {
        throw new Error('Ollama returned empty response');
      }

      return JSON.parse(text);
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === MAX_ATTEMPTS - 1) break;
      const backoffMs = 1000 * Math.pow(2, attempt) + Math.floor(Math.random() * 500);
      console.warn(`[AI] Attempt ${attempt + 1} failed (${err.message}), retrying in ${backoffMs}ms...`);
      await sleep(backoffMs);
    }
  }
  throw lastErr;
}

// ── System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert resume analyst, ATS specialist, and technical recruiter.
You MUST respond with valid JSON only — no markdown, no explanation, no code fences.
Every array in your response MUST contain items — never return empty arrays.

Your response must be a single JSON object with these exact keys:

{
  "skills": [
    {
      "name": "string",
      "category": "programming_language|framework|database|cloud|devops|soft_skill|tool|methodology|other",
      "proficiency": "beginner|intermediate|advanced|expert",
      "yearsOfExperience": number_or_null
    }
  ],
  "missingSkills": [
    {
      "name": "string",
      "category": "string",
      "importance": "nice_to_have|recommended|critical",
      "reason": "string"
    }
  ],
  "atsScore": integer_0_to_100,
  "atsFeedback": "string",
  "improvements": [
    {
      "area": "string",
      "suggestion": "string",
      "impact": "low|medium|high"
    }
  ],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "overallSummary": "string"
}`;

// ── Analysis Prompt ────────────────────────────────────────────────────

const ANALYSIS_PROMPT = `Analyze the following resume and return a JSON object with ALL of these analyses.
IMPORTANT: ALL arrays must be populated — do NOT return empty arrays for any field.

1. **skills** — Extract ALL technical and soft skills. For each: name, category (programming_language, framework, database, cloud, devops, soft_skill, tool, methodology, other), proficiency (beginner, intermediate, advanced, expert) inferred from context, and yearsOfExperience if explicitly stated (else null). Be thorough; include skills implied by tools/frameworks/responsibilities.

2. **missingSkills** — You MUST provide exactly 8–12 missing skills. These are skills NOT on the resume that would strengthen the candidate. Think about: complementary technologies, 2024–2025 market demand, career advancement gaps. For each: name, category, importance (critical/recommended/nice_to_have), reason. Example: if they know React but not testing frameworks, suggest Jest. If they use AWS but not Terraform, suggest that. This array MUST NOT be empty.

3. **atsScore** (0–100), **atsFeedback**, **improvements** (3–5 items with area, suggestion, impact), **strengths** (top 3), **weaknesses** (top 3), **overallSummary** (2–3 sentences) — Score ATS compatibility considering: formatting (20%), keywords (25%), quantified achievements (25%), education (15%), presentation (15%).

Resume text:
---
{RESUME_TEXT}
---`;

// ── Validation ─────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set([
  'programming_language', 'framework', 'database', 'cloud',
  'devops', 'soft_skill', 'tool', 'methodology', 'other',
]);
const VALID_PROFICIENCY = new Set(['beginner', 'intermediate', 'advanced', 'expert']);
const VALID_IMPACT = new Set(['low', 'medium', 'high']);
const VALID_IMPORTANCE = new Set(['nice_to_have', 'recommended', 'critical']);

export function validateAndNormalize(result) {
  // Ensure skills array exists
  if (!Array.isArray(result.skills)) {
    result.skills = [];
  }
  result.skills = result.skills.map((s) => ({
    name: String(s.name || '').trim(),
    category: VALID_CATEGORIES.has(s.category) ? s.category : 'other',
    proficiency: VALID_PROFICIENCY.has(s.proficiency) ? s.proficiency : 'intermediate',
    yearsOfExperience: typeof s.yearsOfExperience === 'number' ? s.yearsOfExperience : null,
  })).filter((s) => s.name.length > 0);

  // ATS score
  result.atsScore = Math.max(0, Math.min(100, Math.round(Number(result.atsScore) || 50)));

  // String fields
  result.atsFeedback = String(result.atsFeedback || '');
  result.overallSummary = String(result.overallSummary || '');

  // Improvements
  if (!Array.isArray(result.improvements)) result.improvements = [];
  result.improvements = result.improvements.map((imp) => ({
    area: String(imp.area || '').trim(),
    suggestion: String(imp.suggestion || '').trim(),
    impact: VALID_IMPACT.has(imp.impact) ? imp.impact : 'medium',
  })).filter((imp) => imp.area && imp.suggestion);

  // Strengths / weaknesses
  result.strengths = Array.isArray(result.strengths) ? result.strengths.map(String) : [];
  result.weaknesses = Array.isArray(result.weaknesses) ? result.weaknesses.map(String) : [];

  // Missing skills
  if (!Array.isArray(result.missingSkills)) result.missingSkills = [];
  result.missingSkills = result.missingSkills.map((ms) => ({
    name: String(ms.name || '').trim(),
    category: String(ms.category || 'other').trim(),
    importance: VALID_IMPORTANCE.has(ms.importance) ? ms.importance : 'recommended',
    reason: String(ms.reason || '').trim(),
  })).filter((ms) => ms.name.length > 0);

  return result;
}

// ── Exported Service ───────────────────────────────────────────────────

/**
 * Run all analyses in a single Ollama call and return a merged result.
 * Replaces the 3-call Gemini approach with a single local model inference.
 */
export async function analyzeResume(resumeText) {
  const start = Date.now();

  const prompt = ANALYSIS_PROMPT.replace('{RESUME_TEXT}', resumeText);
  const rawResult = await callOllama(prompt, SYSTEM_PROMPT);

  // Debug: log response completeness
  console.log(`[AI] Response keys: ${Object.keys(rawResult).join(', ')}`);
  console.log(`[AI] skills: ${rawResult.skills?.length ?? 0}, missingSkills: ${rawResult.missingSkills?.length ?? 0}`);

  const result = validateAndNormalize(rawResult);

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

// ── Test-friendly indirection ──────────────────────────────────────────
// Routes import { aiRunner } and call aiRunner.analyze(). Tests can
// override aiRunner.analyze without touching the module's ESM exports.
export const aiRunner = { analyze: analyzeResume };

// ── Health Check ───────────────────────────────────────────────────────

/**
 * Verify Ollama is running and the configured model is available.
 * Returns { ok, model, error? }
 */
export async function checkOllamaHealth() {
  try {
    const resp = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!resp.ok) return { ok: false, model: MODEL, error: `Ollama HTTP ${resp.status}` };

    const data = await resp.json();
    const models = (data.models || []).map((m) => m.name);
    const found = models.some((m) => m.startsWith(MODEL.split(':')[0]));

    return {
      ok: found,
      model: MODEL,
      availableModels: models,
      error: found ? undefined : `Model "${MODEL}" not found. Run: ollama pull ${MODEL}`,
    };
  } catch (err) {
    return {
      ok: false,
      model: MODEL,
      error: `Ollama not reachable at ${OLLAMA_BASE_URL}: ${err.message}`,
    };
  }
}
