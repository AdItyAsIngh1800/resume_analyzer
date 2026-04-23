import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { checkOllamaHealth } from './services/ai.js';

export function createApp({ enableRateLimit = true } = {}) {
  const app = express();

  // Security: HTTP hardening headers (HSTS, X-Content-Type-Options, etc.)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.use(compression());

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  if (enableRateLimit) {
    app.use('/api/', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests — please try again later' },
    }));

    app.use('/api/auth/', rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many authentication attempts — please try again later' },
    }));
  }

  app.get('/health', async (_req, res) => {
    const ollama = await checkOllamaHealth();
    res.json({
      status: ollama.ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      ai: ollama,
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/resumes', resumeRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
