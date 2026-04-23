import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, errorHandler, notFound } from '../../src/middleware/errorHandler.js';

function mockRes() {
  const res = {
    statusCode: 200,
    headersSent: false,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  return res;
}

describe('ApiError', () => {
  test('stores status, message, detail', () => {
    const err = new ApiError(400, 'Bad', ['x is required']);
    assert.equal(err.status, 400);
    assert.equal(err.message, 'Bad');
    assert.deepEqual(err.detail, ['x is required']);
    assert.ok(err instanceof Error);
  });

  test('omits detail when undefined', () => {
    const err = new ApiError(500, 'Oops');
    assert.equal(err.detail, undefined);
  });
});

describe('errorHandler', () => {
  let origEnv;
  beforeEach(() => { origEnv = process.env.NODE_ENV; });

  test('uses ApiError status + message', () => {
    const res = mockRes();
    errorHandler(new ApiError(404, 'Not found'), {}, res, () => {});
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Not found');
  });

  test('defaults to 500 for generic errors', () => {
    const res = mockRes();
    const origErr = console.error;
    console.error = () => {};
    errorHandler(new Error('boom'), {}, res, () => {});
    console.error = origErr;
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.error, 'boom');
  });

  test('maps Mongoose ValidationError to 400', () => {
    const err = new Error('validation failed');
    err.name = 'ValidationError';
    err.errors = { email: { message: 'required' } };
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Validation failed');
    assert.deepEqual(res.body.detail, { email: 'required' });
  });

  test('maps Mongoose CastError to 400', () => {
    const err = new Error('cast fail');
    err.name = 'CastError';
    err.kind = '_id';
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /Invalid id format/);
  });

  test('maps duplicate-key to 409', () => {
    const err = new Error('dup');
    err.code = 11000;
    err.keyValue = { email: 'a@b.co' };
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    assert.equal(res.statusCode, 409);
    assert.deepEqual(res.body.detail, { email: 'a@b.co' });
  });

  test('maps JWT errors to 401', () => {
    const err = new Error('bad token');
    err.name = 'JsonWebTokenError';
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    assert.equal(res.statusCode, 401);
  });

  test('maps LIMIT_FILE_SIZE to 413', () => {
    const err = new Error('too big');
    err.code = 'LIMIT_FILE_SIZE';
    const res = mockRes();
    errorHandler(err, {}, res, () => {});
    assert.equal(res.statusCode, 413);
  });

  test('delegates to next when headersSent', () => {
    const res = mockRes();
    res.headersSent = true;
    let nextCalled = false;
    errorHandler(new Error('x'), {}, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });

  test('includes stack only in development for 5xx', () => {
    process.env.NODE_ENV = 'development';
    const res = mockRes();
    const origErr = console.error;
    console.error = () => {};
    errorHandler(new Error('oops'), {}, res, () => {});
    console.error = origErr;
    assert.ok(res.body.stack);
    process.env.NODE_ENV = origEnv;
  });

  test('hides stack in production', () => {
    process.env.NODE_ENV = 'production';
    const res = mockRes();
    const origErr = console.error;
    console.error = () => {};
    errorHandler(new Error('oops'), {}, res, () => {});
    console.error = origErr;
    assert.equal(res.body.stack, undefined);
    process.env.NODE_ENV = origEnv;
  });
});

describe('notFound', () => {
  test('returns 404 with route info', () => {
    const res = mockRes();
    notFound({ method: 'GET', originalUrl: '/nope' }, res);
    assert.equal(res.statusCode, 404);
    assert.match(res.body.error, /GET \/nope/);
  });
});
