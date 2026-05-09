import express, { Request, Response } from 'express';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { createInitialState } from '../src/lib/lmsData.ts';
import type { AppState, Assignment, CalendarEvent, Classroom, DiscussionThread, NotificationItem, ResourceItem, Role } from '../src/lib/types.ts';
import { generateAssignmentFeedback, generateQuiz, summarizeDiscussion, summarizeText } from './ai.ts';
import { scoreSubmissionQuality } from './learning.ts';
import { store } from './store.ts';
import { createJsonRoute, createClassCode, classColor, getCurrentSnapshot, mentionsFromMessage, requireAuth, requireRole, API_PREFIX } from './http.ts';
import { registerLearningModules } from './modules/index.ts';

const DEFAULT_PORT = 4000;

export const createLearningOsApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '5mb' }));

  registerLearningModules(app);
  // Domain routes are registered via modules in `server/modules`

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

  const distPath = resolve(process.cwd(), 'dist');
  const hasFrontendBuild = existsSync(join(distPath, 'index.html'));

  if (hasFrontendBuild) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith(API_PREFIX)) {
        next();
        return;
      }

      res.sendFile(join(distPath, 'index.html'));
    });
  }

  app.use((error: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
    console.error(error);
    res.status(500).json({ error: 'Unexpected server error.' });
  });

  return app;
};
