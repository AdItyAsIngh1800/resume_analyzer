import 'dotenv/config';
import { connectDB } from '../config/database.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;
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
