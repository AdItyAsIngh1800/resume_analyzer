import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateAndNormalize } from '../../src/services/ai.js';

describe('validateAndNormalize', () => {
  test('accepts a fully-valid response unchanged', () => {
    const out = validateAndNormalize({
      skills: [{ name: 'Python', category: 'programming_language', proficiency: 'expert', yearsOfExperience: 5 }],
      missingSkills: [{ name: 'Rust', category: 'programming_language', importance: 'recommended', reason: 'growing demand' }],
      atsScore: 87,
      atsFeedback: 'Solid resume',
      improvements: [{ area: 'Summary', suggestion: 'Add headline', impact: 'high' }],
      strengths: ['Quantified results'],
      weaknesses: ['No certifications'],
      overallSummary: 'Senior dev.',
    });
    assert.equal(out.skills.length, 1);
    assert.equal(out.skills[0].proficiency, 'expert');
    assert.equal(out.atsScore, 87);
    assert.equal(out.improvements[0].impact, 'high');
  });

  test('coerces ATS score out of range', () => {
    assert.equal(validateAndNormalize({ atsScore: 150 }).atsScore, 100);
    assert.equal(validateAndNormalize({ atsScore: -20 }).atsScore, 0);
    assert.equal(validateAndNormalize({ atsScore: 'nope' }).atsScore, 50);
  });

  test('defaults missing arrays to empty', () => {
    const out = validateAndNormalize({});
    assert.deepEqual(out.skills, []);
    assert.deepEqual(out.missingSkills, []);
    assert.deepEqual(out.improvements, []);
    assert.deepEqual(out.strengths, []);
    assert.deepEqual(out.weaknesses, []);
  });

  test('filters skills with empty names', () => {
    const out = validateAndNormalize({
      skills: [
        { name: 'React', category: 'framework', proficiency: 'advanced' },
        { name: '', category: 'framework' },
        { name: '   ', category: 'framework' },
      ],
    });
    assert.equal(out.skills.length, 1);
    assert.equal(out.skills[0].name, 'React');
  });

  test('normalizes invalid category to "other"', () => {
    const out = validateAndNormalize({
      skills: [{ name: 'X', category: 'bogus', proficiency: 'intermediate' }],
    });
    assert.equal(out.skills[0].category, 'other');
  });

  test('normalizes invalid proficiency to "intermediate"', () => {
    const out = validateAndNormalize({
      skills: [{ name: 'X', category: 'tool', proficiency: 'godlike' }],
    });
    assert.equal(out.skills[0].proficiency, 'intermediate');
  });

  test('coerces yearsOfExperience to null when non-numeric', () => {
    const out = validateAndNormalize({
      skills: [{ name: 'X', category: 'tool', proficiency: 'expert', yearsOfExperience: 'many' }],
    });
    assert.equal(out.skills[0].yearsOfExperience, null);
  });

  test('drops improvements missing area or suggestion', () => {
    const out = validateAndNormalize({
      improvements: [
        { area: 'A', suggestion: 'S', impact: 'high' },
        { area: 'B', impact: 'medium' },
        { suggestion: 'only suggestion' },
      ],
    });
    assert.equal(out.improvements.length, 1);
  });

  test('defaults invalid improvement impact to "medium"', () => {
    const out = validateAndNormalize({
      improvements: [{ area: 'A', suggestion: 'S', impact: 'massive' }],
    });
    assert.equal(out.improvements[0].impact, 'medium');
  });

  test('defaults invalid missing-skill importance to "recommended"', () => {
    const out = validateAndNormalize({
      missingSkills: [{ name: 'Go', category: 'programming_language', importance: 'mandatory', reason: 'x' }],
    });
    assert.equal(out.missingSkills[0].importance, 'recommended');
  });

  test('coerces string strengths/weaknesses', () => {
    const out = validateAndNormalize({
      strengths: ['A', 123, null],
      weaknesses: ['B'],
    });
    assert.equal(out.strengths.length, 3);
    assert.equal(typeof out.strengths[1], 'string');
  });

  test('coerces string feedback/summary from non-strings', () => {
    const out = validateAndNormalize({ atsFeedback: null, overallSummary: undefined });
    assert.equal(out.atsFeedback, '');
    assert.equal(out.overallSummary, '');
  });
});
