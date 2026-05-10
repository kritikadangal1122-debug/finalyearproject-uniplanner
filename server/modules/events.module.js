import { randomUUID } from 'crypto';
import { store } from '../store.js';
import { API_PREFIX, createJsonRoute, requireAuth, requireRole } from '../http.js';

export const registerEventsModule = (app) => {
  app.get(`${API_PREFIX}/events`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    res.json({ events: store.getSnapshot().app.events });
  }));

  app.post(`${API_PREFIX}/events`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can create events.' });
      return;
    }

    const { title, classId, date, startTime, endTime, type } = req.body;
    if (!title || !classId || !date || !startTime || !endTime || !type) {
      res.status(400).json({ error: 'Missing event fields.' });
      return;
    }

    const event = {
      id: `event-${randomUUID()}`,
      title,
      classId,
      date,
      startTime,
      endTime,
      type,
      color: '#888888',
    };

    store.update((draft) => {
      draft.app.events = [event, ...draft.app.events];
    });

    res.status(201).json({ event });
  }));
};
