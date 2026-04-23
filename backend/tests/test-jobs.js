/**
 * Phase 2c — End-to-end test for Job Matching
 *
 * Prerequisites:
 *   1. docker compose up -d        (MongoDB running)
 *   2. node scripts/seed-jobs.js   (Jobs must be seeded)
 *   3. npm run dev                 (Server running on :8080)
 *
 * Run:
 *   node tests/test-jobs.js
 */

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Resume from '../src/models/Resume.js';
import AnalysisResult from '../src/models/AnalysisResult.js';

const BASE = 'http://localhost:8080';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

async function api(method, endpoint, token = '', body = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${endpoint}`, opts);
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function run() {
  console.log('\n═══ Phase 2c: Job Matching Tests ═══\n');

  // 1. Setup mock data directly in DB
  console.log('1. Setting up mock user, resume, and analysis');
  await mongoose.connect('mongodb://localhost:27017/resume-analyzer');

  const email = `test-jobs-${Date.now()}@example.com`;
  const password = 'TestPass123!';

  // Create User
  const { status: regStatus, json: regJson } = await api('POST', '/api/auth/register', '', {
    name: 'Job Tester',
    email,
    password,
  });
  assert(regStatus === 201, 'Registered test user');
  const token = regJson?.token;

  // Find User in DB to get ID
  const user = await User.findOne({ email });

  // Create Resume directly
  const resume = await Resume.create({
    userId: user._id,
    fileName: 'test-resume.pdf',
    fileSize: 1024,
    extractedText: 'React Developer with Node.js experience',
    status: 'analyzed',
  });

  // Create AnalysisResult directly with specific skills
  await AnalysisResult.create({
    userId: user._id,
    resumeId: resume._id,
    skills: [
      { name: 'JavaScript', category: 'programming_language', proficiency: 'advanced' },
      { name: 'React', category: 'framework', proficiency: 'expert' },
      { name: 'Node.js', category: 'framework', proficiency: 'intermediate' },
      { name: 'HTML5', category: 'programming_language', proficiency: 'advanced' },
      { name: 'CSS', category: 'programming_language', proficiency: 'advanced' },
    ],
    atsScore: 85,
  });

  assert(resume._id, `Created mock resume: ${resume._id}`);

  // 2. Fetch matches for unanalyzed resume
  console.log('\n2. Testing unanalyzed resume');
  const unanalyzedResume = await Resume.create({
    userId: user._id,
    fileName: 'unanalyzed.pdf',
    fileSize: 1024,
    extractedText: 'Just some text',
    status: 'uploaded',
  });
  const { status: errStatus, json: errJson } = await api('GET', `/api/resumes/${unanalyzedResume._id}/matches`, token);
  assert(errStatus === 400, `Returns 400 for unanalyzed resume (got ${errStatus})`);
  assert(errJson?.error?.includes('analyzed'), 'Correct error message');

  // 3. Fetch matches for analyzed resume
  console.log('\n3. Fetching job matches');
  const { status: matchStatus, json: matchJson } = await api('GET', `/api/resumes/${resume._id}/matches`, token);
  
  assert(matchStatus === 200, `Returns 200 for analyzed resume (got ${matchStatus})`);
  
  const matches = matchJson?.matches;
  assert(Array.isArray(matches), 'Matches is an array');
  assert(matches?.length > 0, `Returned ${matches?.length} matching jobs`);
  
  if (matches && matches.length > 0) {
    const topMatch = matches[0];
    assert(topMatch.job?.title, `Top match has title: ${topMatch.job?.title}`);
    assert(typeof topMatch.matchPercentage === 'number', `Has match percentage: ${topMatch.matchPercentage}%`);
    assert(Array.isArray(topMatch.matchedSkills), `Has matched skills array (${topMatch.matchedSkills.length})`);
    assert(Array.isArray(topMatch.missingSkills), `Has missing skills array (${topMatch.missingSkills.length})`);
    
    // With React, JS, Node, HTML, CSS, the top match should likely be the Senior Frontend Engineer or Full Stack
    const titleMatch = topMatch.job?.title?.includes('Frontend') || topMatch.job?.title?.includes('React') || topMatch.job?.title?.includes('Full Stack');
    assert(titleMatch, 'Top match aligns logically with React/JS/Node skills');
    
    // Ensure sorting is correct
    if (matches.length > 1) {
      assert(matches[0].matchPercentage >= matches[1].matchPercentage, 'Results are sorted by match percentage descending');
    }
  }

  // Cleanup
  await mongoose.connection.close();

  console.log(`\n═══ Results: ${passed} passed, ${failed} failed ═══\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('\n✗ Test runner crashed:', err.message);
  process.exit(1);
});
