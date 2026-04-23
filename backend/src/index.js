import 'dotenv/config';
import { connectDB } from '../config/database.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;

// Fail fast on missing/weak critical secrets — prevents footguns in prod.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 characters.');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && /change_in_production|dev[-_]/i.test(process.env.JWT_SECRET)) {
  console.error('FATAL: JWT_SECRET looks like a dev placeholder — set a real secret in production.');
  process.exit(1);
}

const app = createApp();

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
