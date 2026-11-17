// apps/api/src/app.js
import express from 'express';
import { createApiRouter, createInternalRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Mount public API on /api/v1 (§6.1)
  app.use('/api/v1', createApiRouter());

  // Also mount /internal/v1 directly (§6.3) and under /api/v1/internal/v1 for convenience
  app.use('/internal/v1', createInternalRouter());
  app.use('/api/v1/internal/v1', createInternalRouter());

  // 404 handler returning standard error envelope
  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        details: { path: req.originalUrl, method: req.method }
      }
    });
  });

  return app;
}

export default createApp;
