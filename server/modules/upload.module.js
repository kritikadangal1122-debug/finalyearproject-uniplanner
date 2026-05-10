import { randomUUID } from 'crypto';
import { store } from '../store.js';
import { API_PREFIX, requireAuth, requireRole } from '../http.js';
import { upload, uploadToCloudinary, formatBytes } from '../upload.js';

export const registerUploadModule = (app) => {
  app.post(
    `${API_PREFIX}/upload/resource`,
    upload.single('file'),
    async (req, res) => {
      try {
        const auth = requireAuth(req, res);
        if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
          res.status(403).json({ error: 'Only teachers and admins can upload resources.' });
          return;
        }

        const { classId, type, preview } = req.body;

        if (!classId || !req.file) {
          res.status(400).json({ error: 'classId and a file are required.' });
          return;
        }

        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

        const resource = {
          id: `resource-${randomUUID()}`,
          classId,
          name: req.file.originalname,
          type: type ?? 'document',
          size: formatBytes(result.bytes),
          preview: preview ?? '',
          fileUrl: result.secure_url,
          updatedAt: 'Just now',
        };

        store.update((draft) => {
          draft.app.resources = [resource, ...draft.app.resources];
        });

        res.status(201).json({ resource });
      } catch (err) {
        console.error('Resource upload error:', err);
        res.status(500).json({ error: 'File upload failed.' });
      }
    },
  );

  app.post(
    `${API_PREFIX}/upload/submission`,
    upload.single('file'),
    async (req, res) => {
      try {
        const auth = requireAuth(req, res);
        if (!auth) return;

        const { assignmentId, contentText } = req.body;

        if (!assignmentId || !req.file) {
          res.status(400).json({ error: 'assignmentId and a file are required.' });
          return;
        }

        const assignment = store.findAssignmentById(assignmentId);
        if (!assignment) {
          res.status(404).json({ error: 'Assignment not found.' });
          return;
        }

        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

        const submission = {
          id: `submission-${randomUUID()}`,
          assignmentId,
          studentId: auth.user.id,
          contentText: contentText ?? '',
          fileUrl: result.secure_url,
          fileName: req.file.originalname,
          submittedAt: new Date().toISOString(),
          plagiarismScore: 0,
          qualityScore: 0,
          lateFlag: false,
        };

        store.addSubmission(submission);

        store.update((draft) => {
          const a = draft.app.assignments.find((item) => item.id === assignmentId);
          if (a) {
            a.submissions += 1;
            a.status = 'submitted';
          }
        });

        res.status(201).json({ submission });
      } catch (err) {
        console.error('Submission upload error:', err);
        res.status(500).json({ error: 'File upload failed.' });
      }
    },
  );

  app.delete(`${API_PREFIX}/submissions/:submissionId`, (req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    const { submissionId } = req.params;
    const snapshot = store.getSnapshot();
    const submission = snapshot.submissions.find((s) => s.id === submissionId);

    if (!submission) {
      res.status(404).json({ error: 'Submission not found.' });
      return;
    }

    if (submission.studentId !== auth.user.id) {
      res.status(403).json({ error: 'You can only delete your own submission.' });
      return;
    }

    store.update((draft) => {
      draft.submissions = draft.submissions.filter((s) => s.id !== submissionId);
      const a = draft.app.assignments.find((item) => item.id === submission.assignmentId);
      if (a && a.submissions > 0) {
        a.submissions -= 1;
        if (a.submissions === 0) a.status = 'assigned';
      }
    });

    res.json({ ok: true });
  });

  app.patch(`${API_PREFIX}/submissions/:submissionId/grade`, (req, res) => {
    const auth = requireAuth(req, res);
    if (!auth || !requireRole(auth, ['teacher', 'admin'])) {
      res.status(403).json({ error: 'Only teachers and admins can grade submissions.' });
      return;
    }

    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    if (score === undefined) {
      res.status(400).json({ error: 'score is required.' });
      return;
    }

    store.update((draft) => {
      const s = draft.submissions.find((item) => item.id === submissionId);
      if (s) {
        s.score = score;
        s.teacherFeedback = feedback ?? '';
      }

      const sub = draft.submissions.find((item) => item.id === submissionId);
      if (sub) {
        const allForAssignment = draft.submissions.filter((item) => item.assignmentId === sub.assignmentId && item.score !== undefined);
        const a = draft.app.assignments.find((item) => item.id === sub.assignmentId);
        if (a && allForAssignment.length > 0) {
          a.averageScore = Math.round(allForAssignment.reduce((acc, item) => acc + (item.score ?? 0), 0) / allForAssignment.length);
          a.status = 'graded';
        }
      }
    });

    const updated = store.getSnapshot().submissions.find((s) => s.id === submissionId);
    res.json({ ok: true, submission: updated });
  });
};
