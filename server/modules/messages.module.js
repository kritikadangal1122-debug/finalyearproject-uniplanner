import { randomUUID } from 'crypto';
import { store } from '../store.js';
import { API_PREFIX, createJsonRoute, requireAuth } from '../http.js';

export const registerMessagesModule = (app) => {
  app.get(`${API_PREFIX}/messages/:classId`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    res.json({ messages: store.getSnapshot().app.messages.filter((item) => item.classId === req.params.classId) });
  }));

  app.post(`${API_PREFIX}/messages`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { classId, sender, role, message } = req.body;
    if (!classId || !sender || !role || !message) {
      res.status(400).json({ error: 'Missing message fields.' });
      return;
    }

    const chatMessage = {
      id: `message-${randomUUID()}`,
      classId,
      sender,
      role,
      message,
      time: 'Now',
    };

    store.update((draft) => {
      draft.app.messages = [...draft.app.messages, chatMessage];
    });

    res.status(201).json({ message: chatMessage });
  }));
};
