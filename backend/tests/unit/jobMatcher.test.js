import { test, describe, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import Job from '../../src/models/Job.js';
import { findMatchingJobs } from '../../src/services/jobMatcher.js';

function seedJobs(jobs) {
  mock.method(Job, 'find', async () => jobs);
}

describe('findMatchingJobs', () => {
  afterEach(() => { mock.restoreAll(); });

  test('returns 100% match when all required + nice-to-have skills are present', async () => {
    seedJobs([{
      title: 'Frontend Dev',
      requiredSkills: ['React', 'JavaScript'],
      niceToHaveSkills: ['TypeScript'],
    }]);
    const skills = [{ name: 'React' }, { name: 'JavaScript' }, { name: 'TypeScript' }];
    const [m] = await findMatchingJobs(skills);
    assert.equal(m.matchPercentage, 100);
    assert.equal(m.matchedSkills.length, 3);
    assert.equal(m.missingSkills.length, 0);
  });

  test('weights required skills 2x nice-to-have (2+2 of 2+2+1 = 80%)', async () => {
    seedJobs([{
      title: 'Backend Dev',
      requiredSkills: ['Node.js', 'MongoDB'],
      niceToHaveSkills: ['Redis'],
    }]);
    const skills = [{ name: 'Node.js' }, { name: 'MongoDB' }];
    const [m] = await findMatchingJobs(skills);
    assert.equal(m.matchPercentage, 80);
  });

  test('is case-insensitive for skill matching', async () => {
    seedJobs([{
      title: 'X',
      requiredSkills: ['React'],
      niceToHaveSkills: [],
    }]);
    const [m] = await findMatchingJobs([{ name: 'react' }]);
    assert.equal(m.matchPercentage, 100);
  });

  test('trims whitespace around skill names', async () => {
    seedJobs([{
      title: 'X',
      requiredSkills: ['  React  '],
      niceToHaveSkills: [],
    }]);
    const [m] = await findMatchingJobs([{ name: ' React ' }]);
    assert.equal(m.matchPercentage, 100);
  });

  test('tracks matched and missing required skills separately', async () => {
    seedJobs([{
      title: 'X',
      requiredSkills: ['React', 'Vue', 'Angular'],
      niceToHaveSkills: [],
    }]);
    const [m] = await findMatchingJobs([{ name: 'React' }]);
    assert.deepEqual(m.matchedSkills, ['React']);
    assert.deepEqual(m.missingSkills.sort(), ['Angular', 'Vue']);
  });

  test('sorts matches by percentage descending', async () => {
    seedJobs([
      { title: 'Low',  requiredSkills: ['A', 'B', 'C'], niceToHaveSkills: [] },
      { title: 'High', requiredSkills: ['A'],           niceToHaveSkills: [] },
      { title: 'Mid',  requiredSkills: ['A', 'B'],      niceToHaveSkills: [] },
    ]);
    const matches = await findMatchingJobs([{ name: 'A' }]);
    assert.deepEqual(matches.map((m) => m.job.title), ['High', 'Mid', 'Low']);
  });

  test('returns 0% when no skills match', async () => {
    seedJobs([{ title: 'X', requiredSkills: ['Rust'], niceToHaveSkills: ['Go'] }]);
    const [m] = await findMatchingJobs([{ name: 'React' }]);
    assert.equal(m.matchPercentage, 0);
  });

  test('returns 100% for a job with no required or nice-to-have skills', async () => {
    seedJobs([{ title: 'Zero', requiredSkills: [], niceToHaveSkills: [] }]);
    const [m] = await findMatchingJobs([{ name: 'React' }]);
    assert.equal(m.matchPercentage, 100);
  });

  test('ignores skills with no name', async () => {
    seedJobs([{ title: 'X', requiredSkills: ['React'], niceToHaveSkills: [] }]);
    const [m] = await findMatchingJobs([{ name: null }, {}, { name: 'React' }]);
    assert.equal(m.matchPercentage, 100);
  });

  test('returns empty array when no jobs exist', async () => {
    seedJobs([]);
    const matches = await findMatchingJobs([{ name: 'React' }]);
    assert.equal(matches.length, 0);
  });
});
