import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateBody, validateObjectId } from '../../src/middleware/validate.js';

function run(mw, req) {
  return new Promise((resolve) => {
    mw(req, {}, (err) => resolve(err));
  });
}

describe('validateBody', () => {
  test('passes when all fields are valid', async () => {
    const mw = validateBody([
      { field: 'name', type: 'string', required: true, minLength: 1 },
      { field: 'email', type: 'email', required: true },
      { field: 'age', type: 'number', min: 0, max: 150 },
    ]);
    const err = await run(mw, { body: { name: 'Ada', email: 'a@b.co', age: 30 } });
    assert.equal(err, undefined);
  });

  test('rejects missing required field', async () => {
    const mw = validateBody([{ field: 'email', type: 'email', required: true }]);
    const err = await run(mw, { body: {} });
    assert.equal(err.status, 400);
    assert.match(err.message, /Validation failed/);
    assert.ok(err.detail.some((m) => m.includes('email is required')));
  });

  test('rejects invalid email format', async () => {
    const mw = validateBody([{ field: 'email', type: 'email', required: true }]);
    const err = await run(mw, { body: { email: 'not-an-email' } });
    assert.equal(err.status, 400);
    assert.ok(err.detail.some((m) => m.includes('valid email')));
  });

  test('rejects string shorter than minLength', async () => {
    const mw = validateBody([{ field: 'password', type: 'string', required: true, minLength: 8 }]);
    const err = await run(mw, { body: { password: 'short' } });
    assert.equal(err.status, 400);
    assert.ok(err.detail.some((m) => m.includes('at least 8 characters')));
  });

  test('rejects string longer than maxLength', async () => {
    const mw = validateBody([{ field: 'name', type: 'string', maxLength: 3 }]);
    const err = await run(mw, { body: { name: 'Alexander' } });
    assert.equal(err.status, 400);
    assert.ok(err.detail.some((m) => m.includes('at most 3 characters')));
  });

  test('rejects number outside min/max range', async () => {
    const mw = validateBody([{ field: 'age', type: 'number', min: 18, max: 99 }]);
    const tooLow = await run(mw, { body: { age: 10 } });
    const tooHigh = await run(mw, { body: { age: 150 } });
    assert.equal(tooLow.status, 400);
    assert.equal(tooHigh.status, 400);
  });

  test('rejects value not in enum', async () => {
    const mw = validateBody([{ field: 'plan', values: ['free', 'pro'] }]);
    const err = await run(mw, { body: { plan: 'enterprise' } });
    assert.equal(err.status, 400);
    assert.ok(err.detail.some((m) => m.includes('must be one of')));
  });

  test('allows optional field to be absent', async () => {
    const mw = validateBody([{ field: 'middleName', type: 'string', required: false }]);
    const err = await run(mw, { body: {} });
    assert.equal(err, undefined);
  });

  test('accumulates multiple errors', async () => {
    const mw = validateBody([
      { field: 'email', type: 'email', required: true },
      { field: 'password', type: 'string', required: true, minLength: 8 },
    ]);
    const err = await run(mw, { body: {} });
    assert.equal(err.detail.length, 2);
  });

  test('handles missing body gracefully', async () => {
    const mw = validateBody([{ field: 'x', type: 'string', required: true }]);
    const err = await run(mw, {});
    assert.equal(err.status, 400);
  });
});

describe('validateObjectId', () => {
  test('passes for valid ObjectId', async () => {
    const mw = validateObjectId('id');
    const err = await run(mw, { params: { id: '507f1f77bcf86cd799439011' } });
    assert.equal(err, undefined);
  });

  test('rejects invalid ObjectId', async () => {
    const mw = validateObjectId('id');
    const err = await run(mw, { params: { id: 'not-an-id' } });
    assert.equal(err.status, 400);
    assert.match(err.message, /Invalid id/);
  });

  test('uses custom param name', async () => {
    const mw = validateObjectId('resumeId');
    const err = await run(mw, { params: { resumeId: 'bad' } });
    assert.match(err.message, /Invalid resumeId/);
  });
});
