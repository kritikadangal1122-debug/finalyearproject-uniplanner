import { analyticsByRole } from '../../public/js/data.js';
import { buildPlatformHealth, deriveNextBestAction } from '../learning.js';
import { store } from '../store.js';
import { toPublicSnapshot } from '../types.js';
import { API_PREFIX, createJsonRoute, getCurrentSnapshot, requireAuth, requireRole } from '../http.js';

const sessionPayload = (token, userId, role) => ({ token, userId, role });

const dashboardStatePayload = (auth, snapshot = getCurrentSnapshot()) => ({
  ...toPublicSnapshot(snapshot),
  session: sessionPayload(auth.token, auth.user.id, auth.role),
});

export const registerDashboardModule = (app) => {
  app.get(`${API_PREFIX}/state`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    res.json(dashboardStatePayload(auth));
  }));

  app.put(`${API_PREFIX}/state`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { app: nextApp } = req.body;
    if (!nextApp) {
      res.status(400).json({ error: 'Missing app payload.' });
      return;
    }

    store.replaceApp({ ...nextApp, session: null });
    res.json({ ok: true, state: store.getPublicSnapshot() });
  }));

  app.put(`${API_PREFIX}/preferences/widget-order`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { widgetOrder } = req.body;
    if (!widgetOrder?.length) {
      res.status(400).json({ error: 'Widget order is required.' });
      return;
    }

    store.update((draft) => {
      draft.app.preferences.widgetOrder = widgetOrder;
    });

    res.json({ ok: true, state: dashboardStatePayload(auth) });
  }));

  app.get(`${API_PREFIX}/analytics/overview`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const role = req.query.role ?? auth.role;
    const analytics = analyticsByRole[role] ?? analyticsByRole.student;
    const snapshot = getCurrentSnapshot();
    res.json({
      role,
      analytics,
      health: buildPlatformHealth(snapshot),
      nextBestAction: deriveNextBestAction(snapshot, auth.user.id),
    });
  }));

  app.get(`${API_PREFIX}/insights/next-best-action/:userId`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { userId } = req.params;
    if (auth.user.id !== userId && auth.role !== 'admin') {
      res.status(403).json({ error: 'You can only view your own recommendations.' });
      return;
    }

    res.json({ recommendation: deriveNextBestAction(getCurrentSnapshot(), userId) });
  }));
};
