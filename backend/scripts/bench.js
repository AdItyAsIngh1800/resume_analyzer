// Simple latency benchmark for the key read endpoints.
// Seeds a user, a resume, and an analysis, then hits each endpoint N times
// and reports p50 / p95. Useful for catching regressions as we add features.
//
//   node scripts/bench.js                 # default 50 iterations
//   N=200 node scripts/bench.js           # override iteration count
//   BASE=http://localhost:8080 node scripts/bench.js
//
// Requires: server running, MongoDB running, jobs seeded.

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Resume from '../src/models/Resume.js';
import AnalysisResult from '../src/models/AnalysisResult.js';

const BASE = process.env.BASE || 'http://localhost:8080';
const N = Number(process.env.N) || 50;

function percentile(nums, p) {
  const sorted = [...nums].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

async function time(label, fn) {
  const samples = [];
  // warm-up
  for (let i = 0; i < 3; i++) await fn();
  for (let i = 0; i < N; i++) {
    const t = performance.now();
    await fn();
    samples.push(performance.now() - t);
  }
  console.log(
    `  ${label.padEnd(28)} ` +
    `p50=${percentile(samples, 50).toFixed(1)}ms  ` +
    `p95=${percentile(samples, 95).toFixed(1)}ms  ` +
    `mean=${(samples.reduce((a, b) => a + b) / samples.length).toFixed(1)}ms`
  );
}

async function api(method, path, { token, body } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const opts = { method, headers };
  if (body) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  if (res.status >= 400) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

async function run() {
  console.log(`\nBenchmark (N=${N}) against ${BASE}\n`);

  await mongoose.connect(process.env.MONGODB_URI);

  const email = `bench-${Date.now()}@example.com`;
  const { token } = await api('POST', '/api/auth/register', {
    body: { name: 'Bench', email, password: 'Password123!' },
  });

  const user = await User.findOne({ email });
  const resume = await Resume.create({
    userId: user._id,
    fileName: 'bench.pdf',
    fileSize: 2048,
    extractedText: 'Experienced engineer.',
    status: 'analyzed',
  });
  await AnalysisResult.create({
    userId: user._id,
    resumeId: resume._id,
    skills: [
      { name: 'JavaScript', category: 'programming_language', proficiency: 'expert' },
      { name: 'React', category: 'framework', proficiency: 'expert' },
      { name: 'Node.js', category: 'framework', proficiency: 'advanced' },
    ],
    atsScore: 85,
    atsFeedback: 'Good',
    improvements: [{ area: 'Summary', suggestion: 'Add headline', impact: 'high' }],
    missingSkills: [{ name: 'Go', category: 'programming_language', importance: 'recommended', reason: 'x' }],
    strengths: ['a'], weaknesses: ['b'], overallSummary: 'x',
  });

  await time('GET  /api/auth/me',          () => api('GET', '/api/auth/me',                       { token }));
  await time('GET  /api/resumes',          () => api('GET', '/api/resumes',                       { token }));
  await time('GET  /api/resumes/:id',      () => api('GET', `/api/resumes/${resume._id}`,         { token }));
  await time('GET  /api/resumes/:id/analysis', () => api('GET', `/api/resumes/${resume._id}/analysis`, { token }));
  await time('GET  /api/resumes/:id/matches',  () => api('GET', `/api/resumes/${resume._id}/matches`,  { token }));
  await time('GET  /api/resumes/:id/report',   async () => {
    const res = await fetch(`${BASE}/api/resumes/${resume._id}/report`, { headers: { Authorization: `Bearer ${token}` } });
    await res.arrayBuffer();
  });
  await time('GET  /health',               () => api('GET', '/health'));

  // Cleanup
  await User.deleteOne({ _id: user._id });
  await Resume.deleteOne({ _id: resume._id });
  await AnalysisResult.deleteOne({ resumeId: resume._id });

  await mongoose.connection.close();
  console.log('\nDone.\n');
}

run().catch((err) => {
  console.error('Benchmark failed:', err.message);
  process.exit(1);
});
