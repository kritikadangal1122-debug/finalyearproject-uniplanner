import { randomUUID } from 'crypto';
import { store } from '../store.js';
import { API_PREFIX, createJsonRoute, requireAuth, mentionsFromMessage } from '../http.js';

export const registerDiscussionsModule = (app) => {
  app.get(`${API_PREFIX}/discussions/:classId`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    res.json({ discussions: store.getSnapshot().app.discussions.filter((item) => item.classId === req.params.classId) });
  }));

  app.post(`${API_PREFIX}/discussions`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { classId, author, message, role } = req.body;
    if (!classId || !author || !message || !role) {
      res.status(400).json({ error: 'Missing discussion fields.' });
      return;
    }

    const thread = {
      id: `thread-${randomUUID()}`,
      classId,
      author,
      role,
      message,
      time: 'Just now',
      replies: 0,
      mentions: mentionsFromMessage(message),
      pinned: false,
    };

    store.update((draft) => {
      draft.app.discussions = [thread, ...draft.app.discussions];
      draft.analyticsEvents = [
        {
          id: `event-${randomUUID()}`,
          userId: auth.user.id,
          classId,
          type: 'discussion',
          name: 'thread_created',
          payload: { threadId: thread.id },
          createdAt: new Date().toISOString(),
        },
        ...draft.analyticsEvents,
      ];
    });

    res.status(201).json({ thread });
  }));
};
