import { test, describe, before, after, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer, resetDb, api, registerUser } from './helpers.js';
import Resume from '../../src/models/Resume.js';
import AnalysisResult from '../../src/models/AnalysisResult.js';
import Job from '../../src/models/Job.js';
import { aiRunner } from '../../src/services/ai.js';

const originalAnalyze = aiRunner.analyze;

async function seedAnalyzed(user, skills) {
  const resume = await Resume.create({
    userId: user.id,
    fileName: 'test.pdf',
    fileSize: 2048,
    extractedText: 'Experienced engineer.',
    status: 'analyzed',
  });
  await AnalysisResult.create({
    userId: user.id,
    resumeId: resume._id,
    skills,
    atsScore: 82,
    atsFeedback: 'Good',
    improvements: [{ area: 'Summary', suggestion: 'Add headline', impact: 'high' }],
    missingSkills: [{ name: 'Rust', category: 'programming_language', importance: 'recommended', reason: 'modern' }],
    strengths: ['Strong JS'],
    weaknesses: ['No tests'],
    overallSummary: 'Good candidate.',
  });
  return resume;
}

describe('resume upload + listing', () => {
  before(async () => { await startTestServer(); });
  after(async () => { await stopTestServer(); });
  beforeEach(async () => { await resetDb(); });

  test('POST /api/resumes/upload requires auth', async () => {
    const { status } = await api('POST', '/api/resumes/upload');
    assert.equal(status, 401);
  });

  test('POST /api/resumes/upload rejects missing file', async () => {
    const user = await registerUser();
    const { status, body } = await api('POST', '/api/resumes/upload', { token: user.token });
    assert.equal(status, 400);
    assert.match(body.error, /No file|file/i);
  });

  test('POST /api/resumes/upload rejects non-PDF', async () => {
    const user = await registerUser();
    const form = new FormData();
    form.append('resume', new Blob(['hello'], { type: 'text/plain' }), 'resume.txt');
    const res = await fetch(`${await startTestServer()}/api/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user.token}` },
      body: form,
    });
    assert.equal(res.status, 400);
  });

  test('GET /api/resumes lists only the authenticated user\'s resumes', async () => {
    const a = await registerUser({ email: `a-${Date.now()}@x.co` });
    const b = await registerUser({ email: `b-${Date.now()}@x.co` });
    await Resume.create({ userId: a.id, fileName: 'a.pdf', fileSize: 100, extractedText: 'x', status: 'uploaded' });
    await Resume.create({ userId: b.id, fileName: 'b.pdf', fileSize: 100, extractedText: 'y', status: 'uploaded' });
    const { status, body } = await api('GET', '/api/resumes', { token: a.token });
    assert.equal(status, 200);
    assert.equal(body.resumes.length, 1);
    assert.equal(body.resumes[0].fileName, 'a.pdf');
  });

  test('GET /api/resumes/:id rejects invalid ObjectId', async () => {
    const user = await registerUser();
    const { status } = await api('GET', '/api/resumes/not-an-id', { token: user.token });
    assert.equal(status, 400);
  });

  test('GET /api/resumes/:id returns 404 for another user\'s resume', async () => {
    const a = await registerUser({ email: `a-${Date.now()}@x.co` });
    const b = await registerUser({ email: `b-${Date.now()}@x.co` });
    const r = await Resume.create({ userId: b.id, fileName: 'b.pdf', fileSize: 100, extractedText: 'y', status: 'uploaded' });
    const { status } = await api('GET', `/api/resumes/${r._id}`, { token: a.token });
    assert.equal(status, 404);
  });
});

describe('resume analysis (mocked AI)', () => {
  before(async () => { await startTestServer(); });
  after(async () => { await stopTestServer(); });
  beforeEach(async () => { await resetDb(); aiRunner.analyze = originalAnalyze; });

  test('POST /:id/analyze succeeds with mocked AI and increments analysisCount', async () => {
    const user = await registerUser();
    const resume = await Resume.create({
      userId: user.id, fileName: 'r.pdf', fileSize: 100, extractedText: 'Resume text', status: 'uploaded',
    });
    aiRunner.analyze = async () => ({
      skills: [{ name: 'React', category: 'framework', proficiency: 'expert', yearsOfExperience: 3 }],
      atsScore: 90,
      atsFeedback: 'Good',
      improvements: [{ area: 'Summary', suggestion: 'x', impact: 'high' }],
      strengths: ['A'], weaknesses: ['B'], overallSummary: 'Good.',
      missingSkills: [{ name: 'Go', category: 'programming_language', importance: 'recommended', reason: 'x' }],
      modelUsed: 'mock', processingTimeMs: 1,
    });

    const { status, body } = await api('POST', `/api/resumes/${resume._id}/analyze`, { token: user.token });
    assert.equal(status, 201);
    assert.equal(body.atsScore, 90);
    assert.equal(body.skillsCount, 1);

    const stored = await AnalysisResult.findOne({ resumeId: resume._id });
    assert.ok(stored);
    assert.equal(stored.atsScore, 90);

    const me = await api('GET', '/api/auth/me', { token: user.token });
    assert.equal(me.body.user.analysisCount, 1);
  });

  test('POST /:id/analyze returns 409 when already analyzed', async () => {
    const user = await registerUser();
    const resume = await seedAnalyzed(user, [{ name: 'A', category: 'framework', proficiency: 'advanced' }]);
    const { status, body } = await api('POST', `/api/resumes/${resume._id}/analyze`, { token: user.token });
    assert.equal(status, 409);
    assert.ok(body.analysisId);
  });

  test('POST /:id/analyze returns 502 and marks resume error when AI throws', async () => {
    const user = await registerUser();
    const resume = await Resume.create({
      userId: user.id, fileName: 'r.pdf', fileSize: 100, extractedText: 'x', status: 'uploaded',
    });
    aiRunner.analyze = async () => { throw new Error('ollama down'); };
    const { status } = await api('POST', `/api/resumes/${resume._id}/analyze`, { token: user.token });
    assert.equal(status, 502);
    const reloaded = await Resume.findById(resume._id);
    assert.equal(reloaded.status, 'error');
    assert.match(reloaded.errorMessage, /ollama down/);
  });
});

describe('job matches + report', () => {
  before(async () => { await startTestServer(); });
  after(async () => { await stopTestServer(); });
  beforeEach(async () => { await resetDb(); });

  test('GET /:id/matches returns 400 when resume has no analysis', async () => {
    const user = await registerUser();
    const r = await Resume.create({ userId: user.id, fileName: 'r.pdf', fileSize: 100, extractedText: 'x', status: 'uploaded' });
    const { status, body } = await api('GET', `/api/resumes/${r._id}/matches`, { token: user.token });
    assert.equal(status, 400);
    assert.match(body.error, /analyzed/i);
  });

  test('GET /:id/matches returns sorted matches', async () => {
    const user = await registerUser();
    const resume = await seedAnalyzed(user, [
      { name: 'React', category: 'framework', proficiency: 'expert' },
      { name: 'Node.js', category: 'framework', proficiency: 'advanced' },
    ]);
    await Job.create([
      { title: 'Frontend Dev', company: 'A', description: 'x', location: 'Remote',
        requiredSkills: ['React'], niceToHaveSkills: [] },
      { title: 'Rust Eng', company: 'B', description: 'x', location: 'Remote',
        requiredSkills: ['Rust'], niceToHaveSkills: [] },
    ]);
    const { status, body } = await api('GET', `/api/resumes/${resume._id}/matches`, { token: user.token });
    assert.equal(status, 200);
    assert.equal(body.matches.length, 2);
    assert.equal(body.matches[0].job.title, 'Frontend Dev');
    assert.equal(body.matches[0].matchPercentage, 100);
    assert.equal(body.matches[1].matchPercentage, 0);
  });

  test('GET /:id/report returns a PDF stream', async () => {
    const user = await registerUser();
    const resume = await seedAnalyzed(user, [{ name: 'React', category: 'framework', proficiency: 'expert' }]);
    const res = await api('GET', `/api/resumes/${resume._id}/report`, { token: user.token, raw: true });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /application\/pdf/);
    const buf = Buffer.from(await res.arrayBuffer());
    assert.ok(buf.length > 100, 'PDF should have meaningful content');
    assert.equal(buf.slice(0, 4).toString(), '%PDF');
  });

  test('GET /:id/report returns 400 without analysis', async () => {
    const user = await registerUser();
    const r = await Resume.create({ userId: user.id, fileName: 'r.pdf', fileSize: 100, extractedText: 'x', status: 'uploaded' });
    const { status } = await api('GET', `/api/resumes/${r._id}/report`, { token: user.token });
    assert.equal(status, 400);
  });
});
