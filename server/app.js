import express from 'express';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { createInitialState } from '../public/js/data.js';
import { createJsonRoute, requireAuth, API_PREFIX } from './http.js';
import { store } from './store.js';
import { registerLearningModules } from './modules/index.js';

const CORS_ORIGINS = ['http://localhost:5500', 'http://127.0.0.1:5500'];

export const createLearningOsApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '5mb' }));

  // Allow Live Server dev origin
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && CORS_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Expose Cloudinary public config to the browser
  app.get(`${API_PREFIX}/cloudinary-config`, (_req, res) => {
    res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
      uploadPreset: 'uniplanner_unsigned',
    });
  });

  registerLearningModules(app);

  app.post(`${API_PREFIX}/admin/reset-demo`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || auth.role !== 'admin') {
      res.status(403).json({ error: 'Only admins can reset the demo state.' });
      return;
    }

    store.replaceApp({
      ...createInitialState(),
      session: null,
    });

    res.json({ ok: true, state: store.getPublicSnapshot() });
  }));

  const uploadsPath = resolve(process.cwd(), 'server/data/uploads');
  app.use('/uploads', express.static(uploadsPath));

  const publicPath = resolve(process.cwd(), 'public');
  if (existsSync(join(publicPath, 'index.html'))) {
    app.use(express.static(publicPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith(API_PREFIX)) {
        next();
        return;
      }
      res.sendFile(join(publicPath, 'index.html'));
    });
  }

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: 'Unexpected server error.' });
  });

  return app;
};
