import { store } from '../store.js';
import { API_PREFIX, createJsonRoute, requireAuth, getCurrentSnapshot } from '../http.js';

export const registerNotificationsModule = (app) => {
  app.get(`${API_PREFIX}/notifications`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    res.json({ notifications: getCurrentSnapshot().app.notifications });
  }));

  app.patch(`${API_PREFIX}/notifications/:notificationId/read`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { notificationId } = req.params;
    store.update((draft) => {
      draft.app.notifications = draft.app.notifications.map((item) =>
        item.id === notificationId ? { ...item, unread: false } : item
      );
    });

    res.json({ ok: true });
  }));

  app.get(`${API_PREFIX}/notifications/stream`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = () => {
      const snapshot = getCurrentSnapshot();
      const unread = snapshot.app.notifications.filter((item) => item.unread).length;
      res.write(`data: ${JSON.stringify({ unread, timestamp: new Date().toISOString() })}\n\n`);
    };

    sendEvent();
    const timer = setInterval(sendEvent, 15000);

    req.on('close', () => {
      clearInterval(timer);
      res.end();
    });
  }));
};
