import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { createInitialState } from '../src/lib/lmsData.ts';
import type { AppState, Assignment, Classroom, Role } from '../src/lib/types.ts';
import type { AnalyticsEventRecord, BackendSnapshot, GoalRecord, PermissionRecord, PublicAppState, PublicSnapshot, SessionRecord, SubmissionRecord } from './types.ts';
import { toPublicSnapshot } from './types.ts';
import { scoreSubmissionQuality } from './learning.ts';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const DATA_FILE = path.join(DATA_DIR, 'learning-os.json');

const seedSubmissions = (app: AppState): SubmissionRecord[] => {
  const design = app.assignments.find((assignment) => assignment.id === 'assignment-1');
  const frontend = app.assignments.find((assignment) => assignment.id === 'assignment-2');
  const ops = app.assignments.find((assignment) => assignment.id === 'assignment-3');

  return [
    {
      id: 'submission-design-1',
      assignmentId: design?.id ?? 'assignment-1',
      studentId: app.users.find((user) => user.role === 'student')?.id ?? 'user-student',
      contentText: 'I reviewed the interface hierarchy, improved spacing, and documented the keyboard focus states.',
      submittedAt: '2026-05-06T08:25:00.000Z',
      score: 89,
      teacherFeedback: 'Good rationale and clear suggestions.',
      aiFeedback: 'Strong draft. Add one more concrete example of a reduced-friction interaction.',
      plagiarismScore: 6,
      qualityScore: 88,
      lateFlag: false,
    },
    {
      id: 'submission-frontend-1',
      assignmentId: frontend?.id ?? 'assignment-2',
      studentId: app.users.find((user) => user.role === 'student')?.id ?? 'user-student',
      contentText: 'The component tree needs a cleaner separation between view state and server state.',
      submittedAt: '2026-05-05T13:10:00.000Z',
      score: 93,
      teacherFeedback: 'Excellent conceptual explanation.',
      aiFeedback: 'You show strong synthesis. Add one paragraph on event handling edge cases.',
      plagiarismScore: 2,
      qualityScore: 91,
      lateFlag: false,
    },
    {
      id: 'submission-ops-1',
      assignmentId: ops?.id ?? 'assignment-3',
      studentId: app.users.find((user) => user.role === 'student')?.id ?? 'user-student',
      contentText: 'Attendance trends suggest weekly intervention reminders and a short parent update may improve turnout.',
      submittedAt: '2026-05-04T11:30:00.000Z',
      score: 95,
      teacherFeedback: 'Actionable and data-driven.',
      aiFeedback: 'The memo is well aligned with the rubric and can be shortened slightly.',
      plagiarismScore: 1,
      qualityScore: 94,
      lateFlag: false,
    },
  ].map((submission) => ({
    ...submission,
    qualityScore: submission.qualityScore || scoreSubmissionQuality(submission),
  }));
};

const seedGoals = (app: AppState): GoalRecord[] => app.users.map((user) => ({
  id: `goal-${user.id}`,
  userId: user.id,
  title: user.role === 'student'
    ? 'Complete the next learning mission'
    : user.role === 'teacher'
      ? 'Review outstanding work'
      : 'Monitor system health',
  targetType: user.role === 'student' ? 'completion' : 'operations',
  targetValue: user.role === 'student' ? 100 : 1,
  progressValue: user.role === 'student' ? 78 : user.role === 'teacher' ? 92 : 99,
  dueAt: user.role === 'student' ? '2026-05-08T17:00:00.000Z' : undefined,
  status: 'active',
}));

const seedPermissions = (app: AppState): PermissionRecord[] => app.users.map((user) => ({
  id: `perm-${user.id}-${user.role}`,
  userId: user.id,
  permissionKey: user.role === 'student' ? 'classroom:view' : user.role === 'teacher' ? 'classroom:manage' : 'platform:admin',
  scopeType: 'global',
  scopeId: '*',
  createdAt: '2026-05-06T00:00:00.000Z',
}));

const seedAnalyticsEvents = (app: AppState): AnalyticsEventRecord[] => [
  {
    id: 'event-class-opened',
    userId: app.users[0]?.id ?? 'user-student',
    classId: app.classes[0]?.id,
    type: 'classroom',
    name: 'class_opened',
    payload: { route: '/app' },
    createdAt: '2026-05-06T09:00:00.000Z',
  },
  {
    id: 'event-assignment-viewed',
    userId: app.users[1]?.id ?? 'user-teacher',
    classId: app.classes[1]?.id,
    type: 'assignment',
    name: 'assignment_reviewed',
    payload: { assignmentId: app.assignments[1]?.id },
    createdAt: '2026-05-06T09:30:00.000Z',
  },
  {
    id: 'event-admin-audit',
    userId: app.users[2]?.id ?? 'user-admin',
    type: 'admin',
    name: 'platform_audited',
    payload: { activeClasses: app.classes.length },
    createdAt: '2026-05-06T10:15:00.000Z',
  },
];

const createDefaultSnapshot = (): BackendSnapshot => {
  const app = createInitialState();
  return {
    app: {
      ...app,
      session: null,
    },
    submissions: seedSubmissions(app),
    analyticsEvents: seedAnalyticsEvents(app),
    sessions: [],
    goals: seedGoals(app),
    permissions: seedPermissions(app),
  };
};

const clone = <T>(value: T) => structuredClone(value);

export class LearningStore {
  private snapshot: BackendSnapshot;

  constructor() {
    this.snapshot = this.load();
  }

  private ensureFile() {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): BackendSnapshot {
    try {
      if (!existsSync(DATA_FILE)) {
        const snapshot = createDefaultSnapshot();
        this.ensureFile();
        writeFileSync(DATA_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
        return snapshot;
      }

      const raw = readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<BackendSnapshot>;
      const fallback = createDefaultSnapshot();
      return {
        app: {
          ...fallback.app,
          ...(parsed.app ?? {}),
          session: null,
        },
        submissions: parsed.submissions?.length ? parsed.submissions : fallback.submissions,
        analyticsEvents: parsed.analyticsEvents?.length ? parsed.analyticsEvents : fallback.analyticsEvents,
        sessions: parsed.sessions?.length ? parsed.sessions : fallback.sessions,
        goals: parsed.goals?.length ? parsed.goals : fallback.goals,
        permissions: parsed.permissions?.length ? parsed.permissions : fallback.permissions,
      };
    } catch {
      return createDefaultSnapshot();
    }
  }

  private save() {
    this.ensureFile();
    writeFileSync(DATA_FILE, JSON.stringify(this.snapshot, null, 2), 'utf8');
  }

  getSnapshot() {
    return clone(this.snapshot);
  }

  getPublicSnapshot(): PublicSnapshot {
    return toPublicSnapshot(this.getSnapshot());
  }

  update(mutator: (draft: BackendSnapshot) => void) {
    const draft = clone(this.snapshot);
    mutator(draft);
    this.snapshot = draft;
    this.save();
    return this.getSnapshot();
  }

  replaceApp(nextApp: AppState) {
    return this.update((draft) => {
      draft.app = {
        ...nextApp,
        session: null,
      };
    });
  }

  recordSession(record: SessionRecord) {
    return this.update((draft) => {
      draft.sessions = [record, ...draft.sessions.filter((session) => session.userId !== record.userId)];
    });
  }

  revokeSession(token: string) {
    return this.update((draft) => {
      draft.sessions = draft.sessions.filter((session) => session.token !== token);
    });
  }

  appendAnalyticsEvent(event: AnalyticsEventRecord) {
    return this.update((draft) => {
      draft.analyticsEvents = [event, ...draft.analyticsEvents];
    });
  }

  addSubmission(submission: SubmissionRecord) {
    return this.update((draft) => {
      draft.submissions = [submission, ...draft.submissions];
    });
  }

  findUserByEmail(email: string) {
    return this.snapshot.app.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  findUserById(userId: string) {
    return this.snapshot.app.users.find((user) => user.id === userId) ?? null;
  }

  findClassById(classId: string) {
    return this.snapshot.app.classes.find((item) => item.id === classId) ?? null;
  }

  findAssignmentById(assignmentId: string) {
    return this.snapshot.app.assignments.find((item) => item.id === assignmentId) ?? null;
  }

  isSessionActive(token: string) {
    return this.snapshot.sessions.some((session) => session.token === token && session.expiresAt > Date.now());
  }

  getSession(token: string) {
    return this.snapshot.sessions.find((session) => session.token === token) ?? null;
  }

  createAnalyticsEvent(type: string, name: string, payload: Record<string, unknown>, userId: string, classId?: string) {
    const event: AnalyticsEventRecord = {
      id: `event-${randomUUID()}`,
      userId,
      classId,
      type,
      name,
      payload,
      createdAt: new Date().toISOString(),
    };
    this.appendAnalyticsEvent(event);
    return event;
  }
}

export const store = new LearningStore();
