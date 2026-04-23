// Shared test helpers — boot a real Express app against a test DB.
// Requires MongoDB running (docker compose up -d).

import 'dotenv/config';
import mongoose from 'mongoose';

// Force a separate DB so we never touch dev data. Use a unique DB per
// process so parallel test files (node --test) don't clobber each other.
const testDbBase = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/resume-analyzer-test';
process.env.MONGODB_URI = `${testDbBase}-${process.pid}`;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_at_least_32_characters_long_xx';
process.env.NODE_ENV = 'test';

import { createApp } from '../../src/app.js';

let server;
let baseUrl;

export async function startTestServer() {
  if (server) return baseUrl;
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const app = createApp({ enableRateLimit: false });
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  return baseUrl;
}

export async function stopTestServer() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}

export async function resetDb() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

export async function api(method, path, { token, body, raw } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const opts = { method, headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${baseUrl}${path}`, opts);
  if (raw) return res;
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

export async function registerUser(overrides = {}) {
  const user = {
    name: overrides.name || 'Test User',
    email: overrides.email || `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
    password: overrides.password || 'Password123!',
  };
  const { status, body } = await api('POST', '/api/auth/register', { body: user });
  if (status !== 201) throw new Error(`register failed: ${status} ${JSON.stringify(body)}`);
  return { ...user, token: body.token, id: body.user.id };
}
