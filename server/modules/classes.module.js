import { randomUUID } from 'crypto';
import { store } from '../store.js';
import { API_PREFIX, createJsonRoute, createClassCode, classColor, requireAuth, requireRole, getCurrentSnapshot } from '../http.js';

export const registerClassesModule = (app) => {
  app.get(`${API_PREFIX}/classes`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    res.json({ classes: getCurrentSnapshot().app.classes });
  }));

  app.post(`${API_PREFIX}/classes`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can create classes.' });
      return;
    }

    const { title, subject, section, description } = req.body;
    if (!title || !subject || !section || !description) {
      res.status(400).json({ error: 'All class fields are required.' });
      return;
    }

    const snapshot = store.update((draft) => {
      const classroom = {
        id: `class-${randomUUID()}`,
        code: createClassCode(),
        title,
        subject,
        section,
        teacherId: auth.user.id,
        teacherName: auth.user.name,
        color: classColor(),
        description,
        students: 0,
        archived: false,
        progress: 0,
        nextDeadline: 'No deadline set',
        meetingTime: 'TBD',
        tags: [subject, section],
        sections: [{ id: `section-${randomUUID()}`, name: section, studentCount: 0 }],
        resourceCount: 0,
        unreadMessages: 0,
      };

      draft.app.classes = [classroom, ...draft.app.classes];
      draft.app.notifications = [
        {
          id: `note-${randomUUID()}`,
          title: 'Class created',
          description: `${title} is now available for invites.`,
          priority: 'normal',
          unread: true,
          time: 'Just now',
          kind: 'class',
        },
        ...draft.app.notifications,
      ];
      draft.goals = [
        ...draft.goals,
        {
          id: `goal-${randomUUID()}`,
          userId: auth.user.id,
          classId: classroom.id,
          title: `Launch ${title}`,
          targetType: 'classroom',
          targetValue: 1,
          progressValue: 0,
          status: 'active',
        },
      ];
      draft.analyticsEvents = [
        {
          id: `event-${randomUUID()}`,
          userId: auth.user.id,
          classId: classroom.id,
          type: 'classroom',
          name: 'class_created',
          payload: { title },
          createdAt: new Date().toISOString(),
        },
        ...draft.analyticsEvents,
      ];
    });

    res.status(201).json({ class: snapshot.app.classes[0] });
  }));

  app.post(`${API_PREFIX}/classes/join`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Class code is required.' });
      return;
    }

    const classroom = store.getSnapshot().app.classes.find((item) => item.code.toLowerCase() === code.toLowerCase().trim());
    if (!classroom) {
      res.status(404).json({ error: 'Class not found.' });
      return;
    }

    const snapshot = store.update((draft) => {
      draft.app.classes = draft.app.classes.map((item) => item.id === classroom.id ? { ...item, students: item.students + 1 } : item);
      draft.app.notifications = [
        {
          id: `note-${randomUUID()}`,
          title: 'Joined class',
          description: `You joined ${classroom.title}.`,
          priority: 'normal',
          unread: true,
          time: 'Just now',
          kind: 'enrollment',
        },
        ...draft.app.notifications,
      ];
    });

    res.json({ class: snapshot.app.classes.find((item) => item.id === classroom.id) });
  }));

  app.post(`${API_PREFIX}/classes/:classId/archive`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can archive classes.' });
      return;
    }

    const { classId } = req.params;
    const classroom = store.findClassById(classId);
    if (!classroom) {
      res.status(404).json({ error: 'Class not found.' });
      return;
    }

    if (auth.role === 'teacher' && classroom.teacherId !== auth.user.id) {
      res.status(403).json({ error: 'You can only archive classes you own.' });
      return;
    }

    store.update((draft) => {
      draft.app.classes = draft.app.classes.map((item) => item.id === classId ? { ...item, archived: true } : item);
    });

    res.json({ ok: true });
  }));
};
