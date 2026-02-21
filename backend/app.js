import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import configRoutes from './routes/index.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { ensureBootstrapData } from './scripts/bootstrap.js';

const app = express();

app.set('trust proxy', 1);
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/webhooks', webhookRoutes);
app.use(express.json({ limit: '2mb' }));

configRoutes(app);

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Unexpected server error'
  });
});

const startServer = async () => {
  try {
    await connectDb();
    await ensureBootstrapData();

    app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`Server started on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Startup failure:', error);
    process.exit(1);
  }
};

startServer();
