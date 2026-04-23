import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, stopTestServer, resetDb, api, registerUser } from './helpers.js';

describe('auth endpoints', () => {
  before(async () => { await startTestServer(); });
  after(async () => { await stopTestServer(); });
  beforeEach(async () => { await resetDb(); });

  test('POST /api/auth/register creates user and returns token', async () => {
    const { status, body } = await api('POST', '/api/auth/register', {
      body: { name: 'Ada', email: 'ada@example.com', password: 'Password123!' },
    });
    assert.equal(status, 201);
    assert.ok(body.token);
    assert.equal(body.user.email, 'ada@example.com');
    assert.equal(body.user.plan, 'free');
    assert.equal(body.user.analysisCount, 0);
    assert.equal(body.user.passwordHash, undefined, 'passwordHash must never leak');
  });

  test('POST /api/auth/register rejects duplicate email', async () => {
    const payload = { name: 'A', email: 'dup@example.com', password: 'Password123!' };
    await api('POST', '/api/auth/register', { body: payload });
    const { status, body } = await api('POST', '/api/auth/register', { body: payload });
    assert.equal(status, 409);
    assert.match(body.error, /already exists/i);
  });

  test('POST /api/auth/register rejects invalid email', async () => {
    const { status, body } = await api('POST', '/api/auth/register', {
      body: { name: 'A', email: 'not-email', password: 'Password123!' },
    });
    assert.equal(status, 400);
    assert.ok(Array.isArray(body.detail));
  });

  test('POST /api/auth/register rejects short password', async () => {
    const { status } = await api('POST', '/api/auth/register', {
      body: { name: 'A', email: 'x@y.co', password: 'short' },
    });
    assert.equal(status, 400);
  });

  test('POST /api/auth/login returns token for valid credentials', async () => {
    const user = await registerUser({ email: 'login@example.com', password: 'Password123!' });
    const { status, body } = await api('POST', '/api/auth/login', {
      body: { email: user.email, password: 'Password123!' },
    });
    assert.equal(status, 200);
    assert.ok(body.token);
    assert.equal(body.user.email, user.email);
  });

  test('POST /api/auth/login rejects wrong password', async () => {
    const user = await registerUser({ password: 'Password123!' });
    const { status } = await api('POST', '/api/auth/login', {
      body: { email: user.email, password: 'WrongPass123!' },
    });
    assert.equal(status, 401);
  });

  test('POST /api/auth/login rejects unknown email', async () => {
    const { status } = await api('POST', '/api/auth/login', {
      body: { email: 'nobody@example.com', password: 'Password123!' },
    });
    assert.equal(status, 401);
  });

  test('GET /api/auth/me returns current user with valid token', async () => {
    const user = await registerUser();
    const { status, body } = await api('GET', '/api/auth/me', { token: user.token });
    assert.equal(status, 200);
    assert.equal(body.user.email, user.email);
  });

  test('GET /api/auth/me rejects missing token', async () => {
    const { status } = await api('GET', '/api/auth/me');
    assert.equal(status, 401);
  });

  test('GET /api/auth/me rejects invalid token', async () => {
    const { status } = await api('GET', '/api/auth/me', { token: 'not-a-real-token' });
    assert.equal(status, 401);
  });
});
