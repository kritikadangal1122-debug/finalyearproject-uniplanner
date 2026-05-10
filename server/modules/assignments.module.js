import { randomUUID } from 'crypto';
import { store } from '../store.js';
import { API_PREFIX, createJsonRoute, requireAuth, requireRole } from '../http.js';

export const registerAssignmentsModule = (app) => {
  app.get(`${API_PREFIX}/assignments`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    res.json({ assignments: store.getSnapshot().app.assignments });
  }));

  app.post(`${API_PREFIX}/assignments`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can create assignments.' });
      return;
    }

    const { classId, title, kind, dueDate, maxPoints, description } = req.body;

    if (!classId || !title || !kind || !dueDate || !maxPoints || !description) {
      res.status(400).json({ error: 'Missing assignment fields.' });
      return;
    }

    const assignment = {
      id: `assignment-${randomUUID()}`,
      classId,
      title,
      kind,
      dueDate,
      status: 'assigned',
      maxPoints,
      submissions: 0,
      averageScore: 0,
      manualReview: kind !== 'quiz',
      aiPlagiarismScore: 0,
      description,
      rubric: ['Accuracy', 'Clarity', 'Timeliness'],
    };

    store.update((draft) => {
      draft.app.assignments = [assignment, ...draft.app.assignments];
      draft.analyticsEvents = [
        {
          id: `event-${randomUUID()}`,
          userId: auth.user.id,
          classId,
          type: 'assignment',
          name: 'assignment_created',
          payload: { assignmentId: assignment.id, title },
          createdAt: new Date().toISOString(),
        },
        ...draft.analyticsEvents,
      ];
    });

    res.status(201).json({ assignment });
  }));
};
