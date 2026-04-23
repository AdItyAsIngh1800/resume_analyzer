/**
 * Phase 2b — End-to-end test: upload PDF → analyze → verify Gemini response stored
 *
 * Prerequisites:
 *   1. docker compose up -d        (MongoDB running)
 *   2. Set GEMINI_API_KEY in backend/.env to a real key
 *   3. cd backend && npm run dev   (server on :8080)
 *
 * Run:
 *   node tests/test-analysis.js
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8080';

let passed = 0;
let failed = 0;
let token = '';
let resumeId = '';
let analysisId = '';

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

async function api(method, endpoint, body, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };

  if (body instanceof FormData) {
    opts.body = body;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${endpoint}`, opts);
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

// ── Test Suite ──────────────────────────────────────────────────────────

async function run() {
  console.log('\n═══ Phase 2b: Gemini API Integration Tests ═══\n');

  // ── 1. Register a test user ───────────────────────────────────────
  console.log('1. Register test user');
  const email = `test-analysis-${Date.now()}@example.com`;
  const { status: regStatus, json: regJson } = await api('POST', '/api/auth/register', {
    name: 'Analysis Tester',
    email,
    password: 'TestPass123!',
  });
  assert(regStatus === 201, `Register → 201 (got ${regStatus})`);
  assert(regJson?.token, 'Received JWT');
  token = regJson?.token;

  // ── 2. Upload sample PDF ─────────────────────────────────────────
  console.log('\n2. Upload sample PDF');
  const pdfPath = path.resolve(__dirname, '../data/sample-resumes/software-engineer.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.error(`  ✗ Sample PDF not found at ${pdfPath}`);
    console.error('    Run the generate script first or place a PDF there.');
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('resume', blob, 'software-engineer.pdf');

  const { status: upStatus, json: upJson } = await api('POST', '/api/resumes/upload', formData);
  assert(upStatus === 201, `Upload → 201 (got ${upStatus})`);
  assert(upJson?.resumeId, `Got resumeId: ${upJson?.resumeId}`);
  assert(upJson?.status === 'uploaded', `Status is 'uploaded'`);
  resumeId = upJson?.resumeId;

  // ── 3. Analyze — no auth → 401 ───────────────────────────────────
  console.log('\n3. Analyze without auth');
  const savedToken = token;
  token = '';
  const { status: noAuthStatus } = await api('POST', `/api/resumes/${resumeId}/analyze`);
  assert(noAuthStatus === 401, `No auth → 401 (got ${noAuthStatus})`);
  token = savedToken;

  // ── 4. Analyze resume via Gemini ──────────────────────────────────
  console.log('\n4. Analyze resume (calls Gemini API — may take 5–15s)');
  const analyzeStart = Date.now();
  const { status: azStatus, json: azJson } = await api('POST', `/api/resumes/${resumeId}/analyze`);
  const analyzeTime = Date.now() - analyzeStart;
  console.log(`   (completed in ${(analyzeTime / 1000).toFixed(1)}s)`);

  assert(azStatus === 201, `Analyze → 201 (got ${azStatus})`);
  assert(azJson?.analysisId, `Got analysisId: ${azJson?.analysisId}`);
  assert(typeof azJson?.atsScore === 'number', `ATS score is a number: ${azJson?.atsScore}`);
  assert(azJson?.atsScore >= 0 && azJson?.atsScore <= 100, `ATS score in range 0–100: ${azJson?.atsScore}`);
  assert(azJson?.skillsCount > 0, `Extracted ${azJson?.skillsCount} skills`);
  assert(azJson?.missingSkillsCount > 0, `Found ${azJson?.missingSkillsCount} missing skills`);
  assert(azJson?.processingTimeMs > 0, `Processing time tracked: ${azJson?.processingTimeMs}ms`);
  assert(azJson?.status === 'analyzed', `Status is 'analyzed'`);
  analysisId = azJson?.analysisId;

  // ── 5. Re-analyze → 409 (already analyzed) ───────────────────────
  console.log('\n5. Re-analyze same resume → 409');
  const { status: reStatus, json: reJson } = await api('POST', `/api/resumes/${resumeId}/analyze`);
  assert(reStatus === 409, `Duplicate analyze → 409 (got ${reStatus})`);
  assert(reJson?.analysisId, 'Returns existing analysisId');

  // ── 6. Get analysis results ───────────────────────────────────────
  console.log('\n6. Get analysis results');
  const { status: getStatus, json: getJson } = await api('GET', `/api/resumes/${resumeId}/analysis`);
  assert(getStatus === 200, `GET analysis → 200 (got ${getStatus})`);

  const a = getJson?.analysis;
  assert(a, 'Analysis object exists');
  assert(Array.isArray(a?.skills) && a.skills.length > 0, `Skills array: ${a?.skills?.length} items`);
  assert(typeof a?.atsScore === 'number', `ATS score stored: ${a?.atsScore}`);
  assert(typeof a?.atsFeedback === 'string' && a.atsFeedback.length > 10, 'ATS feedback is substantive');
  assert(Array.isArray(a?.improvements) && a.improvements.length > 0, `Improvements: ${a?.improvements?.length}`);
  assert(Array.isArray(a?.strengths) && a.strengths.length > 0, `Strengths: ${a?.strengths?.length}`);
  assert(Array.isArray(a?.weaknesses) && a.weaknesses.length > 0, `Weaknesses: ${a?.weaknesses?.length}`);
  assert(typeof a?.overallSummary === 'string' && a.overallSummary.length > 10, 'Overall summary exists');
  assert(Array.isArray(a?.missingSkills) && a.missingSkills.length > 0, `Missing skills: ${a?.missingSkills?.length}`);
  assert(a?.modelUsed === 'gemini-2.5-flash', `Model recorded: ${a?.modelUsed}`);

  // Verify skill structure
  const firstSkill = a?.skills?.[0];
  assert(firstSkill?.name, `First skill name: ${firstSkill?.name}`);
  assert(firstSkill?.category, `First skill category: ${firstSkill?.category}`);
  assert(firstSkill?.proficiency, `First skill proficiency: ${firstSkill?.proficiency}`);

  // Verify improvement structure
  const firstImprovement = a?.improvements?.[0];
  assert(firstImprovement?.area, `First improvement area: ${firstImprovement?.area}`);
  assert(firstImprovement?.suggestion, `First improvement has suggestion`);
  assert(firstImprovement?.impact, `First improvement impact: ${firstImprovement?.impact}`);

  // Verify missing skill structure
  const firstMissing = a?.missingSkills?.[0];
  assert(firstMissing?.name, `First missing skill: ${firstMissing?.name}`);
  assert(firstMissing?.importance, `Importance level: ${firstMissing?.importance}`);
  assert(firstMissing?.reason, 'Has reason for recommendation');

  // ── 7. Verify resume status updated ───────────────────────────────
  console.log('\n7. Verify resume status updated');
  const { status: rStatus, json: rJson } = await api('GET', `/api/resumes/${resumeId}`);
  assert(rStatus === 200, `GET resume → 200 (got ${rStatus})`);
  assert(rJson?.resume?.status === 'analyzed', `Resume status is 'analyzed'`);

  // ── 8. Verify user analysis count incremented ─────────────────────
  console.log('\n8. Verify user analysisCount');
  const { status: meStatus, json: meJson } = await api('GET', '/api/auth/me');
  assert(meStatus === 200, `GET /me → 200 (got ${meStatus})`);
  assert(meJson?.user?.analysisCount === 1, `analysisCount is 1 (got ${meJson?.user?.analysisCount})`);

  // ── 9. Analysis for non-existent resume → 404 ────────────────────
  console.log('\n9. Edge cases');
  const fakeId = '507f1f77bcf86cd799439011';
  const { status: nfStatus } = await api('POST', `/api/resumes/${fakeId}/analyze`);
  assert(nfStatus === 404, `Non-existent resume → 404 (got ${nfStatus})`);

  const { status: nfGetStatus } = await api('GET', `/api/resumes/${fakeId}/analysis`);
  assert(nfGetStatus === 404, `Analysis for non-existent → 404 (got ${nfGetStatus})`);

  // ── Results ───────────────────────────────────────────────────────
  console.log(`\n═══ Results: ${passed} passed, ${failed} failed ═══\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('\n✗ Test runner crashed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
