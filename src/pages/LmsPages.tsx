import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Archive,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  CloudUpload,
  Edit3,
  FolderOpen,
  GraduationCap,
  Globe,
  Grid3X3,
  HeartHandshake,
  Lightbulb,
  Lock,
  LogIn,
  MessageCircle,
  Moon,
  MoveRight,
  PanelTop,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Users,
  Video,
  Workflow,
} from 'lucide-react';
import { useLms } from '../context/LmsContext';
import { api } from '../lib/api';
import type { AnalyticsOverviewResponse, DashboardStateResponse } from '../lib/api';
import { analyticsByRole } from '../lib/lmsData';
import {
  Assignment,
  CalendarEvent,
  Classroom,
  DiscussionThread,
  NotificationItem,
  ResourceItem,
  Role,
  StudentSubmission,
  UserAccount,
} from '../lib/types';

const roleLabels: Record<Role, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
};

const widgetMeta = {
  progress: {
    icon: Target,
    title: 'Progress Snapshot',
    description: 'Completion, streaks, and recent momentum.',
  },
  classes: {
    icon: BookOpen,
    title: 'Classroom Focus',
    description: 'Active classes, codes, and sections.',
  },
  assignments: {
    icon: ClipboardCheck,
    title: 'Assignment Queue',
    description: 'Due work, grading status, and rubrics.',
  },
  activity: {
    icon: MessageCircle,
    title: 'Collaboration Feed',
    description: 'Discussions, chat, mentions, and replies.',
  },
  assistant: {
    icon: Sparkles,
    title: 'Study Assistant',
    description: 'Summaries, recommendations, and quick help.',
  },
  calendar: {
    icon: CalendarDays,
    title: 'Schedule Lens',
    description: 'Deadlines, meetings, and reminders.',
  },
};

function ClipboardCheck(props: { className?: string }) {
  return <CheckCircle2 className={props.className} />;
}

const widgetOrderMap = ['progress', 'classes', 'assignments', 'activity', 'assistant', 'calendar'];

const quickAccounts = [
  { role: 'student' as const, email: 'alex@nexus.dev' },
  { role: 'teacher' as const, email: 'sarah@nexus.dev' },
  { role: 'admin' as const, email: 'admin@nexus.dev' },
];

const metricClass = 'rounded-3xl border border-border-subtle bg-[var(--panel)] p-5 shadow-[0_20px_80px_rgba(15,23,42,0.18)]';

function StatCard({ title, value, note, icon: Icon, accent }: { title: string; value: string | number; note: string; icon: typeof Sparkles; accent: string; key?: string | number }) {
  return (
    <div className={metricClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-text-muted">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold text-text-primary">{value}</h3>
        </div>
        <div className={`rounded-2xl p-3 ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="mt-4 text-sm text-text-secondary">{note}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-border-subtle">
      <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function ShellSection({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={metricClass}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ViewPill({ label }: { label: string; key?: string | number }) {
  return <span className="rounded-full border border-border-subtle bg-white/5 px-3 py-1 text-xs font-medium text-text-secondary">{label}</span>;
}

function getClassColor(classroom: Classroom) {
  return { backgroundColor: classroom.color };
}

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useLms();
  const [email, setEmail] = useState('alex@nexus.dev');
  const [password, setPassword] = useState('classroom123!');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const result = await signIn({ email, password });
    setBusy(false);

    if (!result.ok) {
      setError(result.error ?? 'Unable to sign in.');
      return;
    }

    navigate('/app', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),_transparent_30%),linear-gradient(180deg,#020617,#0f172a_45%,#111827)] text-text-primary">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-secondary">
                <Sparkles className="h-4 w-4 text-accent" />
                Nexus LMS for modern classrooms
              </div>
              <div className="space-y-4 max-w-2xl">
                <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  Classroom software that actually moves faster than the work.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-text-secondary">
                  A role-aware LMS for students, teachers, and administrators with real CRUD, live collaboration, analytics, scheduling, and persistent preferences.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Role access</p>
                  <p className="mt-2 text-xl font-semibold text-white">JWT-ready sessions</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Workflow</p>
                  <p className="mt-2 text-xl font-semibold text-white">Assignments, chat, files</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-text-muted">UX</p>
                  <p className="mt-2 text-xl font-semibold text-white">Dark, light, mobile-first</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Active classes', value: '12' },
                { label: 'Completion rate', value: '92%' },
                { label: 'Live updates', value: 'Realtime' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-text-muted">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[var(--panel)] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Sign in</p>
                <h2 className="mt-2 text-3xl font-semibold text-text-primary">Access your workspace</h2>
              </div>
              <div className="rounded-2xl border border-border-subtle bg-white/5 p-3">
                <Lock className="h-5 w-5 text-primary" />
              </div>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="email">Email</label>
                <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-text-primary outline-none transition focus:border-primary/60" placeholder="alex@nexus.dev" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="password">Password</label>
                <input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-text-primary outline-none transition focus:border-primary/60" placeholder="classroom123!" />
              </div>

              {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? 'Signing in...' : 'Open workspace'}
                <LogIn className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-sm text-text-secondary">Quick demo access</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {quickAccounts.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword('classroom123!');
                    }}
                    className="rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-left transition hover:border-primary/50 hover:bg-primary/10"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{roleLabels[account.role]}</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{account.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { currentUser } = useLms();
  const [snapshot, setSnapshot] = useState<DashboardStateResponse | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [widgetOrder, setWidgetOrder] = useState<string[]>(widgetOrderMap);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [stateResponse, overviewResponse] = await Promise.all([
          api.state(),
          api.analyticsOverview(),
        ]);

        if (!active) {
          return;
        }

        setSnapshot(stateResponse);
        setOverview(overviewResponse);
        setWidgetOrder(stateResponse.app.preferences.widgetOrder.length ? stateResponse.app.preferences.widgetOrder : widgetOrderMap);
        setError('');
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard data.');
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const app = snapshot?.app;
  const currentSnapshotUser = app?.users.find((user) => user.id === snapshot?.session?.userId) ?? currentUser;
  const analytics = overview?.analytics ?? analyticsByRole[(snapshot?.session?.role ?? currentSnapshotUser?.role ?? 'student') as keyof typeof analyticsByRole];
  const classes = app?.classes.filter((item) => !item.archived).slice(0, 4) ?? [];
  const assignments = app?.assignments.slice(0, 4) ?? [];
  const notifications = app?.notifications.slice(0, 4) ?? [];

  const orderedWidgets = widgetOrder
    .map((type) => ({ type, meta: widgetMeta[type as keyof typeof widgetMeta] }))
    .filter((item) => item.meta);

  const moveWidget = (from: number, to: number) => {
    setWidgetOrder((previous) => {
      if (to < 0 || to >= previous.length) {
        return previous;
      }

      const next = [...previous];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      void api.updateWidgetOrder(next).catch(() => setWidgetOrder(previous));
      return next;
    });
  };

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.22),rgba(124,58,237,0.12),rgba(15,118,110,0.12))] p-7 shadow-2xl shadow-black/10 sm:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.32em] text-white/70">
              <Sparkles className="h-3 w-3 text-accent" />
              Personalized workspace
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome back, {currentSnapshotUser?.name.split(' ')[0] ?? 'Learner'}.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/80">
              {currentSnapshotUser?.role === 'teacher'
                ? 'Your classrooms are live, grading queues are clear, and learners have fresh feedback waiting.'
                : currentSnapshotUser?.role === 'admin'
                  ? 'Platform health is stable. Monitor classes, insights, and security controls from one place.'
                  : 'Your weekly plan is on track. You have one due assignment, three active discussions, and a full schedule.'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
            <StatCard title="Completion" value={`${analytics.completion}%`} note="Across assigned work this week" icon={Target} accent="bg-emerald-500" />
            <StatCard title="Attendance" value={`${analytics.attendance}%`} note="Live attendance and check-ins" icon={Users} accent="bg-blue-500" />
            <StatCard title="Streak" value={`${analytics.streak} days`} note="Consistency across study sessions" icon={FlameIcon} accent="bg-amber-500" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {[
          { title: 'Classes', value: app?.classes.filter((item) => !item.archived).length ?? 0, note: 'Open classrooms and sections', icon: BookOpen, accent: 'bg-primary' },
          { title: 'Assignments', value: app?.assignments.length ?? 0, note: 'Tracked across quizzes, projects, and essays', icon: ClipboardCheck, accent: 'bg-secondary' },
          { title: 'Notifications', value: app?.notifications.filter((item) => item.unread).length ?? 0, note: 'Unread priority alerts', icon: BellIcon, accent: 'bg-amber-500' },
          { title: 'Resources', value: app?.resources.length ?? 0, note: 'Files, folders, and video content', icon: FolderOpen, accent: 'bg-teal-500' },
        ].map((item) => (
          <StatCard key={item.title} title={item.title} value={item.value} note={item.note} icon={item.icon} accent={item.accent} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <ShellSection
          title="Custom dashboard widgets"
          subtitle="Drag cards to reorder your workspace. The layout is persisted for the logged-in account."
          action={<ViewPill label="Drag and drop enabled" />}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <AnimatePresence>
              {orderedWidgets.map((entry, index) => {
                const meta = entry.meta;
                if (!meta) {
                  return null;
                }

                const Icon = meta.icon;
                return (
                  <motion.article
                    layout
                    key={entry.type}
                    draggable
                    onDragStart={() => setDraggedWidget(entry.type)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (!draggedWidget || draggedWidget === entry.type) {
                        return;
                      }
                      const from = widgetOrder.indexOf(draggedWidget);
                      const to = widgetOrder.indexOf(entry.type);
                      moveWidget(from, to);
                      setDraggedWidget(null);
                    }}
                    className="rounded-3xl border border-border-subtle bg-white/5 p-5 transition hover:border-primary/40 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-primary/20 p-3 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-text-primary">{meta.title}</h3>
                          <p className="mt-1 text-sm text-text-secondary">{meta.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <button type="button" onClick={() => moveWidget(index, index - 1)} className="rounded-full border border-border-subtle p-2 transition hover:border-primary/50 hover:text-text-primary"><ChevronLeft className="h-4 w-4" /></button>
                        <button type="button" onClick={() => moveWidget(index, index + 1)} className="rounded-full border border-border-subtle p-2 transition hover:border-primary/50 hover:text-text-primary"><ChevronRight className="h-4 w-4" /></button>
                      </div>
                    </div>

                    <div className="mt-5">
                      {entry.type === 'progress' ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">Current progress</span>
                            <span className="font-semibold text-white">{analytics.completion}%</span>
                          </div>
                          <ProgressBar value={analytics.completion} />
                          <div className="grid grid-cols-3 gap-3 text-sm text-text-secondary">
                            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3">
                              <p className="text-xs uppercase tracking-[0.24em]">Grade</p>
                              <p className="mt-1 text-lg font-semibold text-text-primary">{analytics.averageGrade}%</p>
                            </div>
                            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3">
                              <p className="text-xs uppercase tracking-[0.24em]">Engagement</p>
                              <p className="mt-1 text-lg font-semibold text-text-primary">{analytics.engagement}%</p>
                            </div>
                            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3">
                              <p className="text-xs uppercase tracking-[0.24em]">Streak</p>
                              <p className="mt-1 text-lg font-semibold text-text-primary">{analytics.streak}d</p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {entry.type === 'classes' ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {classes.map((classroom) => (
                            <div key={classroom.id} className="rounded-2xl border border-border-subtle bg-black/10 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-text-primary">{classroom.title}</p>
                                  <p className="text-xs text-text-secondary">{classroom.subject} · {classroom.section}</p>
                                </div>
                                <span className="h-3 w-3 rounded-full" style={getClassColor(classroom)} />
                              </div>
                              <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                                <span>{classroom.students} learners</span>
                                <span>{classroom.code}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {entry.type === 'assignments' ? (
                        <div className="space-y-3">
                          {assignments.map((assignment) => (
                            <div key={assignment.id} className="rounded-2xl border border-border-subtle bg-black/10 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-text-primary">{assignment.title}</p>
                                  <p className="text-xs text-text-secondary">{assignment.kind} · {assignment.dueDate}</p>
                                </div>
                                <ViewPill label={assignment.status} />
                              </div>
                              <ProgressBar value={assignment.maxPoints ? (assignment.averageScore / assignment.maxPoints) * 100 : 0} />
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {entry.type === 'activity' ? (
                        <div className="space-y-3">
                          {app?.discussions.slice(0, 3).map((thread) => (
                            <div key={thread.id} className="rounded-2xl border border-border-subtle bg-black/10 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-text-primary">{thread.author}</p>
                                  <p className="mt-1 text-sm text-text-secondary">{thread.message}</p>
                                </div>
                                {thread.pinned ? <ViewPill label="Pinned" /> : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {entry.type === 'assistant' ? (
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-border-subtle bg-black/10 p-4 text-sm text-text-secondary">
                            <p className="font-semibold text-text-primary">Suggested study plan</p>
                            <p className="mt-2">Review rubric examples, finish today’s submission, then spend 20 minutes in the discussion thread to answer one peer question.</p>
                          </div>
                          <div className="rounded-2xl border border-border-subtle bg-black/10 p-4 text-sm text-text-secondary">
                            <p className="font-semibold text-text-primary">Recommended resources</p>
                            <p className="mt-2">State machine workshop, critique rubric, and peer feedback checklist are most relevant right now.</p>
                          </div>
                        </div>
                      ) : null}

                      {entry.type === 'calendar' ? (
                        <div className="space-y-3">
                          {app?.events.slice(0, 3).map((event) => (
                            <div key={event.id} className="rounded-2xl border border-border-subtle bg-black/10 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-text-primary">{event.title}</p>
                                  <p className="text-xs text-text-secondary">{event.date} · {event.startTime} - {event.endTime}</p>
                                </div>
                                <CalendarDays className="h-4 w-4 text-text-muted" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        </ShellSection>

        <div className="space-y-6">
          <ShellSection title="Priority notifications" subtitle="Unread items are surfaced here first.">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          </ShellSection>

          <ShellSection title="Today at a glance" subtitle="A compact feed of tasks, meetings, and reminders.">
            <div className="space-y-3">
              {app?.events.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </ShellSection>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ notification }: { notification: NotificationItem; key?: string | number }) {
  const accent = notification.priority === 'high' ? 'bg-red-500/15 text-red-200 border-red-500/20' : notification.priority === 'normal' ? 'bg-blue-500/15 text-blue-200 border-blue-500/20' : 'bg-emerald-500/15 text-emerald-200 border-emerald-500/20';
  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.24em] ${accent}`}>{notification.priority}</span>
            {notification.unread ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-text-primary">{notification.title}</p>
          <p className="mt-1 text-sm text-text-secondary">{notification.description}</p>
        </div>
        <p className="text-xs text-text-muted">{notification.time}</p>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: CalendarEvent; key?: string | number }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{event.title}</p>
          <p className="mt-1 text-sm text-text-secondary">{event.date}</p>
        </div>
        <ViewPill label={event.type} />
      </div>
      <p className="mt-3 text-xs text-text-muted">
        {event.startTime} - {event.endTime}
      </p>
    </div>
  );
}

export function ClassesPage() {
  const navigate = useNavigate();
  const { state, createClassroom, joinClassroom, archiveClassroom, unarchiveClassroom, currentUser, currentRole } = useLms();
  const [form, setForm] = useState({ title: '', subject: '', section: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const canManageClasses = currentRole === 'teacher' || currentRole === 'admin';

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createClassroom(form);
    setForm({ title: '', subject: '', section: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Classrooms</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">Create, join, archive, and organize classes</h1>
        </div>
        <ViewPill label={`${state.classes.filter((item) => !item.archived).length} active`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {canManageClasses && (
          <ShellSection title="Create class" subtitle="Teachers and admins can spin up a class in seconds.">
            <form className="space-y-4" onSubmit={onSubmit}>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Class title" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              <input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Subject" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              <input value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value })} placeholder="Section / group" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short description" rows={4} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:brightness-110">
                <Plus className="h-4 w-4" />
                Create classroom
              </button>
            </form>
          </ShellSection>
        )}

        <div className="space-y-6">
          {currentRole === 'student' && (
            <ShellSection title="Join class" subtitle="Enter a class code to join instantly.">
              <div className="flex gap-3">
                <input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="NX-2048" className="flex-1 rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                <button type="button" onClick={() => joinClassroom(joinCode)} className="rounded-2xl bg-secondary px-4 py-3 font-semibold text-white transition hover:brightness-110">Join</button>
              </div>
            </ShellSection>
          )}

          {currentRole === 'student' ? (
            <ShellSection title="Classes you've joined" subtitle="Your enrolled classrooms and active learning spaces.">
              <div className="space-y-3">
                {state.classes.filter((item) => !item.archived).map((classroom) => (
                  <button key={classroom.id} type="button" onClick={() => navigate(`/app/classes/${classroom.id}`)} className="w-full text-left rounded-2xl border border-border-subtle bg-white/5 p-4 transition hover:border-primary/40 hover:bg-white/10 cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{classroom.title}</p>
                        <p className="text-sm text-text-secondary">{classroom.subject} · {classroom.section}</p>
                        <p className="mt-2 text-xs text-text-muted">Code {classroom.code} · {classroom.students} learners · {classroom.resourceCount} files</p>
                      </div>
                      <ViewPill label={`${classroom.progress}% done`} />
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={classroom.progress} />
                    </div>
                  </button>
                ))}
              </div>
            </ShellSection>
          ) : (
            <ShellSection title="Teacher tools" subtitle="Archive stale classes and keep spaces focused.">
              <div className="space-y-3">
                {state.classes.map((classroom) => (
                  <div key={classroom.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => navigate(`/app/classes/${classroom.id}`)} className="flex-1 text-left transition hover:text-primary">
                        <p className="text-sm font-semibold text-text-primary hover:text-primary">{classroom.title}</p>
                        <p className="text-sm text-text-secondary">{classroom.subject} · {classroom.section}</p>
                        <p className="mt-2 text-xs text-text-muted">Code {classroom.code} · {classroom.students} learners · {classroom.resourceCount} files</p>
                      </button>
                      {!classroom.archived ? (
                        <button type="button" disabled={currentUser?.id !== classroom.teacherId && currentUser?.role !== 'admin'} onClick={() => archiveClassroom(classroom.id)} className="rounded-full border border-border-subtle p-2 text-text-secondary transition hover:border-red-500/40 hover:text-red-200 disabled:opacity-40">
                          <Archive className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button type="button" disabled={currentUser?.id !== classroom.teacherId && currentUser?.role !== 'admin'} onClick={() => unarchiveClassroom(classroom.id)} className="rounded-full border border-border-subtle p-2 text-text-secondary transition hover:border-emerald-400/40 hover:text-emerald-200 disabled:opacity-40" title="Unarchive class">
                            <MoveRight className="h-4 w-4" />
                          </button>
                          <ViewPill label="Archived" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={classroom.progress} />
                    </div>
                  </div>
                ))}
              </div>
            </ShellSection>
          )}
        </div>
      </div>
    </div>
  );
}

export function AssignmentsPage() {
  const { state, createAssignment, currentRole, currentUser, addSubmission, removeSubmission, gradeSubmission } = useLms();
  const [form, setForm] = useState({ classId: state.classes[0]?.id ?? '', title: '', kind: 'assignment' as Assignment['kind'], dueDate: '', maxPoints: 100, description: '' });
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const canCreateAssignments = currentRole === 'teacher' || currentRole === 'admin';

  const mySubmissions = state.submissions.filter((s) => s.studentId === currentUser?.id);
  const submittedAssignmentIds = new Set(mySubmissions.map((s) => s.assignmentId));

  const pendingAssignments = state.assignments.filter((a) => !submittedAssignmentIds.has(a.id));
  const completedAssignments = state.assignments.filter((a) => submittedAssignmentIds.has(a.id));

  const onPublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPublishing(true);
    setPublishError('');
    try {
      createAssignment(form);
      if (materialFile) {
        const formData = new FormData();
        formData.append('file', materialFile);
        formData.append('classId', form.classId);
        formData.append('type', 'document');
        formData.append('preview', `Material for: ${form.title}`);
        await api.uploadResource(formData);
      }
      setForm({ classId: state.classes[0]?.id ?? '', title: '', kind: 'assignment', dueDate: '', maxPoints: 100, description: '' });
      setMaterialFile(null);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Failed to upload material.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteSubmission = async (sub: StudentSubmission) => {
    removeSubmission(sub.id);
    try { await api.deleteSubmission(sub.id); } catch { /* server best-effort */ }
  };

  const handleGrade = async (submissionId: string, score: number, feedback: string) => {
    try {
      await api.gradeSubmission(submissionId, score, feedback);
      gradeSubmission(submissionId, score, feedback);
    } catch (err) {
      console.error('Grade failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Assignments</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">Design quizzes, projects, rubric grading, and feedback</h1>
        </div>
        <ViewPill label={currentRole === 'teacher' ? 'Teacher controls on' : 'Learner view'} />
      </div>

      {canCreateAssignments ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <ShellSection title="Create assignment" subtitle="Add new work with deadlines, max points, and an optional material file.">
              <form className="space-y-4" onSubmit={onPublish}>
                <select value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
                  {state.classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}
                </select>
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Assignment title" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as Assignment['kind'] })} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="project">Project</option>
                  </select>
                  <input value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} placeholder="Due date" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input value={String(form.maxPoints)} onChange={(event) => setForm({ ...form, maxPoints: Number(event.target.value) })} type="number" min="1" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                  <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short description" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border-subtle bg-white/5 px-4 py-3 transition hover:border-primary/50">
                  <CloudUpload className="h-4 w-4 shrink-0 text-text-muted" />
                  <span className="text-sm text-text-secondary">{materialFile ? materialFile.name : 'Attach a material file (optional)'}</span>
                  <input type="file" className="sr-only" onChange={(event) => setMaterialFile(event.target.files?.[0] ?? null)} />
                </label>
                {publishError ? <p className="text-sm text-red-300">{publishError}</p> : null}
                <button type="submit" disabled={publishing} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                  <Plus className="h-4 w-4" />
                  {publishing ? 'Publishing…' : 'Publish assignment'}
                </button>
              </form>
            </ShellSection>

            <ShellSection title="Assignment queue" subtitle="Auto-grading, manual grading, plagiarism risk, and rubrics.">
              <div className="space-y-3">
                {state.assignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} classes={state.classes} />
                ))}
              </div>
            </ShellSection>
          </div>

          {state.submissions.length > 0 && (
            <ShellSection title="Grade submissions" subtitle="Review student work and add a score with optional feedback.">
              <div className="space-y-3">
                {state.submissions.map((sub) => {
                  const assignment = state.assignments.find((a) => a.id === sub.assignmentId);
                  const student = state.users.find((u) => u.id === sub.studentId);
                  if (!assignment) return null;
                  return (
                    <TeacherGradeCard
                      key={sub.id}
                      submission={sub}
                      assignment={assignment}
                      studentName={student?.name ?? 'Student'}
                      onGrade={handleGrade}
                    />
                  );
                })}
              </div>
            </ShellSection>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <ShellSection title="Assignment queue" subtitle="Your pending work — upload a file on each card to submit.">
            <div className="space-y-3">
              {pendingAssignments.length === 0 ? (
                <p className="rounded-2xl border border-border-subtle bg-black/10 p-5 text-sm text-text-secondary">
                  No pending assignments. Check completed work below.
                </p>
              ) : (
                pendingAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    classes={state.classes}
                    isStudent
                    currentUserId={currentUser?.id ?? ''}
                    onSubmitSuccess={(sub) => addSubmission(sub)}
                  />
                ))
              )}
            </div>
          </ShellSection>

          {completedAssignments.length > 0 && (
            <ShellSection title="Completed assignments" subtitle="Your submitted work — grades and feedback appear here once marked.">
              <div className="space-y-3">
                {completedAssignments.map((assignment) => {
                  const sub = mySubmissions.find((s) => s.assignmentId === assignment.id)!;
                  const classroom = state.classes.find((c) => c.id === assignment.classId);
                  return (
                    <CompletedAssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      submission={sub}
                      classroomTitle={classroom?.title}
                      onDelete={() => handleDeleteSubmission(sub)}
                    />
                  );
                })}
              </div>
            </ShellSection>
          )}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment, classes, isStudent, currentUserId, onSubmitSuccess }: {
  assignment: Assignment;
  classes: Classroom[];
  key?: string | number;
  isStudent?: boolean;
  currentUserId?: string;
  onSubmitSuccess?: (sub: StudentSubmission) => void;
}) {
  const classroom = classes.find((item) => item.id === assignment.classId);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignmentId', assignment.id);
      formData.append('contentText', notes);
      const response = await api.uploadSubmission(formData);
      onSubmitSuccess?.({
        id: response.submission.id,
        assignmentId: assignment.id,
        studentId: currentUserId ?? response.submission.studentId,
        fileName: response.submission.fileName ?? file.name,
        fileUrl: response.submission.fileUrl,
        notes,
        submittedAt: response.submission.submittedAt,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.');
      setSubmitting(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setSubmitError('');
    setSubmitting(false);
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-text-primary">{assignment.title}</p>
            <ViewPill label={assignment.kind} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">{classroom?.title ?? 'Unlinked class'} · {assignment.dueDate}</p>
          <p className="mt-2 text-sm text-text-secondary">{assignment.description}</p>
        </div>
        <ViewPill label={isStudent ? 'assigned' : assignment.status} />
      </div>

      {!isStudent && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Submissions</p>
            <p className="mt-1 font-semibold text-text-primary">{assignment.submissions}</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Average score</p>
            <p className="mt-1 font-semibold text-text-primary">{assignment.averageScore}/{assignment.maxPoints}</p>
          </div>
        </div>
      )}



      {isStudent && (
        <form className="mt-4 space-y-3 border-t border-border-subtle pt-4" onSubmit={handleSubmit}>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border-subtle bg-white/5 px-4 py-3 transition hover:border-primary/50">
            <CloudUpload className="h-4 w-4 shrink-0 text-text-muted" />
            <span className="text-sm text-text-secondary">{file ? file.name : 'Attach your submission file'}</span>
            <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          {file ? (
            <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-black/20 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-text-primary">{file.name}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
              >
                <Trash2 className="h-3 w-3" />
                Remove file
              </button>
            </div>
          ) : null}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for your teacher (optional)" rows={2} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-sm outline-none focus:border-primary/60" />
          {submitError ? <p className="text-sm text-red-300">{submitError}</p> : null}
          <button type="submit" disabled={!file || submitting} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
            <CloudUpload className="h-4 w-4" />
            {submitting ? 'Submitting…' : 'Submit work'}
          </button>
        </form>
      )}
    </div>
  );
}

function CompletedAssignmentCard({ assignment, submission, classroomTitle, onDelete }: {
  assignment: Assignment;
  submission: StudentSubmission;
  classroomTitle?: string;
  onDelete: () => void;
  key?: string | number;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    onDelete();
  };

  const submittedDate = new Date(submission.submittedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-text-primary">{assignment.title}</p>
            <ViewPill label={assignment.kind} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">{classroomTitle ?? 'Unlinked class'} · {assignment.dueDate}</p>
        </div>
        <ViewPill label={submission.score !== undefined ? 'graded' : 'submitted'} />
      </div>

      <div className="mt-3 rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Submitted file</p>
        <a
          href={submission.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          {submission.fileName}
        </a>
        <p className="mt-1 text-text-muted">{submittedDate}</p>
        {submission.notes && <p className="mt-1 text-text-secondary italic">"{submission.notes}"</p>}
      </div>

      {submission.score !== undefined && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Score</p>
            <p className="mt-1 font-semibold text-text-primary">{submission.score}/{assignment.maxPoints}</p>
          </div>
          {submission.teacherFeedback && (
            <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Teacher feedback</p>
              <p className="mt-1 text-text-secondary">{submission.teacherFeedback}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 border-t border-border-subtle pt-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleting ? 'Removing…' : 'Delete submission'}
        </button>
      </div>
    </div>
  );
}

function TeacherGradeCard({ submission, assignment, studentName, onGrade }: {
  submission: StudentSubmission;
  assignment: Assignment;
  studentName: string;
  onGrade: (submissionId: string, score: number, feedback: string) => Promise<void>;
  key?: string | number;
}) {
  const [score, setScore] = useState(submission.score !== undefined ? String(submission.score) : '');
  const [feedback, setFeedback] = useState(submission.teacherFeedback ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(submission.score !== undefined);

  const handleGrade = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const numScore = Number(score);
    if (!score || isNaN(numScore)) return;
    setSaving(true);
    await onGrade(submission.id, numScore, feedback);
    setSaved(true);
    setSaving(false);
  };

  const submittedDate = new Date(submission.submittedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-text-primary">{assignment.title}</p>
            <ViewPill label={assignment.kind} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">{studentName} · submitted {submittedDate}</p>
        </div>
        <ViewPill label={saved ? 'graded' : 'submitted'} />
      </div>

      <div className="mt-3 rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Submitted file</p>
        <a
          href={submission.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          {submission.fileName}
        </a>
        {submission.notes && <p className="mt-1 text-text-secondary italic">"{submission.notes}"</p>}
      </div>

      <form className="mt-3 space-y-3 border-t border-border-subtle pt-3" onSubmit={handleGrade}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-text-muted">Score (max {assignment.maxPoints})</label>
            <input
              type="number"
              min="0"
              max={assignment.maxPoints}
              value={score}
              onChange={(e) => { setScore(e.target.value); setSaved(false); }}
              placeholder={`0 – ${assignment.maxPoints}`}
              className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-text-muted">Feedback (optional)</label>
            <input
              value={feedback}
              onChange={(e) => { setFeedback(e.target.value); setSaved(false); }}
              placeholder="Add a comment…"
              className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving || !score}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" />
          {saving ? 'Saving…' : saved ? 'Update grade' : 'Save grade'}
        </button>
      </form>
    </div>
  );
}

export function CollaborationPage() {
  const { state, currentUser, createThread } = useLms();
  const [classId, setClassId] = useState(state.classes[0]?.id ?? '');
  const [threadMessage, setThreadMessage] = useState('');

  const threads = state.discussions.filter((thread) => thread.classId === classId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <ShellSection title="Class discussions" subtitle="Threaded conversations, mentions, and pinned notes.">
        <div className="mb-4 flex items-center gap-3">
          <select value={classId} onChange={(event) => setClassId(event.target.value)} className="rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
            {state.classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}
          </select>
          <ViewPill label={`${threads.length} threads`} />
        </div>

        <form
          className="mb-5 space-y-3 rounded-3xl border border-border-subtle bg-black/10 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!currentUser || !threadMessage.trim()) {
              return;
            }
            createThread({ classId, author: currentUser.name, message: threadMessage, role: currentUser.role });
            setThreadMessage('');
          }}
        >
          <textarea value={threadMessage} onChange={(event) => setThreadMessage(event.target.value)} rows={3} placeholder="Start a discussion, mention @teacher, or ask a question..." className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
          <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 font-semibold text-white transition hover:brightness-110">
            <MessageCircle className="h-4 w-4" />
            Post thread
          </button>
        </form>

        <div className="space-y-3">
          {threads.map((thread) => <ThreadCard key={thread.id} thread={thread} />)}
        </div>
      </ShellSection>
    </div>
  );
}

function ThreadCard({ thread }: { thread: DiscussionThread; key?: string | number }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{thread.author}</p>
            <ViewPill label={thread.role} />
            {thread.pinned ? <ViewPill label="Pinned" /> : null}
          </div>
          <p className="mt-2 text-sm text-text-secondary">{thread.message}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
            <span>{thread.time}</span>
            <span>{thread.replies} replies</span>
          </div>
        </div>
        <HeartHandshake className="h-5 w-5 text-accent" />
      </div>
    </div>
  );
}

// Live chat UI removed — ChatBubble component no longer used.

export function AnalyticsPage() {
  const { analyticsKey, state } = useLms();
  const analytics = analyticsByRole[analyticsKey];
  const maxWeek = Math.max(...analytics.weeklyProgress);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">Progress, engagement, attendance, and performance insights</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard title="Attendance" value={`${analytics.attendance}%`} note="Rolling 30-day check-in rate" icon={Users} accent="bg-blue-500" />
        <StatCard title="Completion" value={`${analytics.completion}%`} note="Assignment completion this term" icon={CheckCircle2} accent="bg-emerald-500" />
        <StatCard title="Average grade" value={`${analytics.averageGrade}%`} note="Weighted across current coursework" icon={GraduationCap} accent="bg-amber-500" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ShellSection title="Weekly progress" subtitle="The bars below simulate term-over-term movement.">
          <div className="grid grid-cols-7 gap-3">
            {analytics.weeklyProgress.map((value, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end rounded-2xl border border-border-subtle bg-black/10 p-2">
                  <div className="w-full rounded-xl bg-gradient-to-t from-primary to-secondary" style={{ height: `${(value / maxWeek) * 100}%` }} />
                </div>
                <p className="text-xs text-text-muted">W{index + 1}</p>
              </div>
            ))}
          </div>
        </ShellSection>


      </div>

      <ShellSection title="Live platform overview" subtitle="Current application data captured from the persisted store.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
            <p className="text-sm text-text-secondary">Active classes</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{state.classes.filter((item) => !item.archived).length}</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
            <p className="text-sm text-text-secondary">Unread notifications</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{state.notifications.filter((item) => item.unread).length}</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-white/5 p-4">
            <p className="text-sm text-text-secondary">Open resources</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{state.resources.length}</p>
          </div>
        </div>
      </ShellSection>
    </div>
  );
}

function GridCalendar({ events }: { events: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => event.date === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className={metricClass}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={goToPreviousMonth} className="rounded-full border border-border-subtle p-2 transition hover:border-primary/50 hover:text-text-primary">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={goToNextMonth} className="rounded-full border border-border-subtle p-2 transition hover:border-primary/50 hover:text-text-primary">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-text-muted py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square rounded-lg bg-transparent" />
        ))}
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          return (
            <div
              key={day}
              className="aspect-square rounded-lg border border-border-subtle bg-black/20 p-2 flex flex-col transition hover:border-primary/50 hover:bg-black/30"
            >
              <p className="text-xs font-semibold text-text-secondary mb-1">{day}</p>
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium truncate"
                    style={{ backgroundColor: `${event.color}30`, color: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[9px] text-text-muted px-1.5">+{dayEvents.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarPage() {
  const { state, createEvent, currentRole } = useLms();
  const [form, setForm] = useState({ title: '', classId: state.classes[0]?.id ?? '', date: '', startTime: '', endTime: '', type: 'class' as CalendarEvent['type'] });
  const canCreateEvents = currentRole === 'teacher' || currentRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Calendar</p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">View and manage your schedule</h1>
        </div>
        <ViewPill label={`${state.events.length} total events`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <ShellSection title="Add event" subtitle="Sync assignments, exams, and meetings into one schedule.">
          {canCreateEvents ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                createEvent(form);
                setForm({ title: '', classId: state.classes[0]?.id ?? '', date: '', startTime: '', endTime: '', type: 'class' });
              }}
            >
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Event title" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              <select value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
                {state.classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}
              </select>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as CalendarEvent['type'] })} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
                  <option value="class">Class</option>
                  <option value="deadline">Deadline</option>
                  <option value="exam">Exam</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} type="time" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
                <input value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} type="time" className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:brightness-110">
                <Plus className="h-4 w-4" />
                Save event
              </button>
            </form>
          ) : (
            <div className="rounded-3xl border border-border-subtle bg-black/10 p-5 text-sm text-text-secondary">
              Students can follow the shared schedule, while teachers and admins manage the calendar.
            </div>
          )}
        </ShellSection>

        <GridCalendar events={state.events} />
      </div>

      {/* Upcoming events list */}
      <ShellSection title="Upcoming events" subtitle="Your next 10 scheduled items in chronological order.">
        <div className="space-y-3">
          {state.events.slice(0, 10).map((event) => (
            <div key={event.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{event.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{event.date}</p>
                  <p className="mt-2 text-xs text-text-muted">{event.startTime} - {event.endTime}</p>
                </div>
                <ViewPill label={event.type} />
              </div>
            </div>
          ))}
        </div>
      </ShellSection>
    </div>
  );
}

export function ResourcesPage() {
  const { state, currentRole } = useLms();
  const [classId, setClassId] = useState(state.classes[0]?.id ?? '');
  const [type, setType] = useState<ResourceItem['type']>('document');
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [resources, setResources] = useState(state.resources);
  const canManageResources = currentRole === 'teacher' || currentRole === 'admin';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('classId', classId);
      formData.append('type', type);
      formData.append('preview', preview);
      const result = await api.uploadResource(formData);
      setResources((previous) => [result.resource as ResourceItem, ...previous]);
      setFile(null);
      setPreview('');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <ShellSection title="Upload resource" subtitle="Store class files, folders, and videos directly — files go to Cloudinary.">
        {canManageResources ? (
          <form className="space-y-4" onSubmit={onSubmit}>
            <select value={classId} onChange={(event) => setClassId(event.target.value)} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
              {state.classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.title}</option>)}
            </select>

            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border-subtle bg-white/5 px-4 py-6 text-center transition hover:border-primary/50">
              <CloudUpload className="h-7 w-7 text-text-muted" />
              {file ? (
                <span className="text-sm font-medium text-text-primary">{file.name}</span>
              ) : (
                <span className="text-sm text-text-secondary">Click to choose a file, or drag and drop</span>
              )}
              <input
                type="file"
                className="sr-only"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <select value={type} onChange={(event) => setType(event.target.value as ResourceItem['type'])} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="folder">Folder</option>
              <option value="link">Link</option>
            </select>

            <textarea value={preview} onChange={(event) => setPreview(event.target.value)} placeholder="Short description (optional)" rows={3} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60" />

            {uploadError ? (
              <p className="text-sm text-red-300">{uploadError}</p>
            ) : null}

            <button type="submit" disabled={!file || uploading} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
              <CloudUpload className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Upload resource'}
            </button>
          </form>
        ) : (
          <div className="rounded-3xl border border-border-subtle bg-black/10 p-5 text-sm text-text-secondary">
            Students can browse and preview shared materials. Upload access is reserved for teachers and admins.
          </div>
        )}
      </ShellSection>

      <ShellSection title="Resource library" subtitle="Class-specific files with previews, types, and update timestamps.">
        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{resource.name}</p>
                  <p className="mt-1 text-sm text-text-secondary">{resource.preview}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
                    <span>{resource.type}</span>
                    <span>{resource.size}</span>
                    <span>{resource.updatedAt}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ViewPill label={resource.type} />
                  {resource.fileUrl ? (
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:text-primary-dark">
                      Open file
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ShellSection>
    </div>
  );
}

export function SettingsPage() {
  const { state, currentUser, toggleTheme, setTheme, setLanguage, resetDemoData } = useLms();

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <ShellSection title="Preferences" subtitle="Adjust theme, language, and workspace defaults.">
        <div className="space-y-4">
          <button type="button" onClick={toggleTheme} className="flex w-full items-center justify-between rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-left transition hover:border-primary/40">
            <span className="flex items-center gap-3"><Moon className="h-4 w-4 text-text-muted" /> Theme</span>
            <span className="text-sm text-text-secondary">Toggle dark/light</span>
          </button>
          <div className="grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={() => setTheme('dark')} className="rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-left transition hover:border-primary/40">
              <Sun className="mb-3 h-4 w-4 text-accent" />
              <p className="text-sm font-semibold text-text-primary">Dark mode</p>
            </button>
            <button type="button" onClick={() => setTheme('light')} className="rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-left transition hover:border-primary/40">
              <Moon className="mb-3 h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-text-primary">Light mode</p>
            </button>
          </div>
          <div>
            <label className="mb-2 block text-sm text-text-secondary">Language</label>
            <select value={state.preferences.language} onChange={(event) => setLanguage(event.target.value)} className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60">
              {['English', 'Spanish', 'French', 'Japanese'].map((language) => <option key={language}>{language}</option>)}
            </select>
          </div>
          <button type="button" onClick={resetDemoData} className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle px-4 py-3 text-text-secondary transition hover:border-primary/40 hover:text-text-primary">
            <RefreshCw className="h-4 w-4" />
            Reset demo data
          </button>
        </div>
      </ShellSection>

      <ShellSection title="Account and platform" subtitle="Current access level, session mode, and role-based experience.">
        <div className="space-y-4 rounded-3xl border border-border-subtle bg-black/10 p-4">
          <div className="flex items-center gap-4">
            <img src={currentUser?.avatar} alt={currentUser?.name} className="h-16 w-16 rounded-2xl object-cover" />
            <div>
              <p className="text-lg font-semibold text-text-primary">{currentUser?.name}</p>
              <p className="text-sm text-text-secondary">{currentUser?.title}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ViewPill label={currentUser?.role ?? 'guest'} />
            <ViewPill label={state.preferences.language} />
          </div>
          <div className="rounded-2xl border border-border-subtle bg-white/5 p-4 text-sm text-text-secondary">
            This shell uses persisted sessions, client-side role checks, and a storage-backed data model that is ready to swap to a real backend API.
          </div>
        </div>
      </ShellSection>
    </div>
  );
}

export function AdminPage() {
  const { state, createUser, updateUser, deleteUser, updateUserRole, currentRole } = useLms();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as const,
    title: '',
    bio: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    title: '',
    bio: '',
    role: 'student' as const,
  });

  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.password) {
      createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        title: formData.title,
        bio: formData.bio,
      });
      setFormData({ name: '', email: '', password: '', role: 'student', title: '', bio: '' });
      setShowCreateForm(false);
    }
  };

  const handleEditUser = (user: UserAccount) => {
    setEditingUserId(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      title: user.title,
      bio: user.bio,
      role: user.role,
    });
  };

  const handleUpdateUser = (e: FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      updateUser({
        userId: editingUserId,
        name: editFormData.name,
        email: editFormData.email,
        title: editFormData.title,
        bio: editFormData.bio,
        role: editFormData.role,
      });
      setEditingUserId(null);
    }
  };

  const handleChangeRole = (userId: string, newRole: Role) => {
    updateUserRole(userId, newRole);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId);
    }
  };

  const isAdmin = currentRole === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Admin center</p>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">Security, health, and platform governance</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard title="Schools online" value="24" note="Multi-tenant environments active" icon={Shield} accent="bg-emerald-500" />
        <StatCard title="Sync health" value="99.98%" note="Background jobs and integrations healthy" icon={CloudUpload} accent="bg-blue-500" />
        <StatCard title="Blocked threats" value="18" note="Rate-limit and auth defenses triggered" icon={Lock} accent="bg-red-500" />
      </div>
      <ShellSection title="Policies and access" subtitle="Admins can tune platform controls and permission models.">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            'Role-based middleware',
            'Audit log retention',
            'Rate limiting',
            'OAuth provider mapping',
            'Content moderation',
            'Parent portal access',
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-border-subtle bg-white/5 p-4 text-sm text-text-secondary">
              {item}
            </div>
          ))}
        </div>
      </ShellSection>

      <ShellSection title="User management" subtitle="Create, read, update, and delete users. Grant or change roles.">
        <div className="space-y-4">
          {isAdmin && !showCreateForm && !editingUserId && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
            >
              <Plus className="h-4 w-4" />
              Add new user
            </button>
          )}

          {showCreateForm && (
            <form onSubmit={handleCreateUser} className="space-y-4 rounded-2xl border border-border-subtle bg-black/10 p-6">
              <h3 className="font-semibold text-text-primary">Create new user</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Secure password"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Job title"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Bio</label>
                  <input
                    type="text"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short bio"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-white transition hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Create user
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle px-4 py-3 text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {editingUserId && (
            <form onSubmit={handleUpdateUser} className="space-y-4 rounded-2xl border border-border-subtle bg-black/10 p-6">
              <h3 className="font-semibold text-text-primary">Edit user</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    placeholder="Job title"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-text-secondary">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as Role })}
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm text-text-secondary">Bio</label>
                  <input
                    type="text"
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    placeholder="Short bio"
                    className="w-full rounded-2xl border border-border-subtle bg-white/5 px-4 py-3 outline-none focus:border-primary/60 text-text-primary placeholder:text-text-muted"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-white transition hover:bg-primary/90"
                >
                  <Check className="h-4 w-4" />
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUserId(null)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle px-4 py-3 text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </ShellSection>

      <ShellSection title="Platform roster" subtitle="Manage users, change roles, and remove accounts.">
        <div className="space-y-3">
          {state.users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-1">
                <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">{user.name}</p>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && editingUserId !== user.id && (
                  <>
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value as Role)}
                      className="rounded-2xl border border-border-subtle bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 text-text-primary"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="rounded-2xl border border-border-subtle bg-white/5 p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
                      title="Edit user"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {state.users.filter((u) => u.role === 'admin').length > 1 || user.role !== 'admin' ? (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="rounded-2xl border border-border-subtle bg-white/5 p-2 text-text-secondary transition hover:border-red-500/40 hover:text-red-500"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="rounded-2xl border border-border-subtle bg-white/5 p-2 text-text-muted cursor-not-allowed" title="Cannot delete the only admin">
                        <Trash2 className="h-4 w-4 opacity-50" />
                      </div>
                    )}
                  </>
                )}
                {editingUserId !== user.id && !isAdmin && <ViewPill label={user.role} />}
              </div>
            </div>
          ))}
        </div>
      </ShellSection>
    </div>
  );
}

function Check(props: { className?: string }) {
  return <CheckCircle2 className={props.className} />;
}

function FlameIcon(props: { className?: string }) {
  return <Target className={props.className} />;
}

function BellIcon(props: { className?: string }) {
  return <CircleAlert className={props.className} />;
}

export function ClassDetailPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const { state } = useLms();
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState<string | null>(null);
  const [assignmentFiles, setAssignmentFiles] = useState<Record<string, File[]>>({});
  const { currentRole } = useLms();
  const [deletedAssignmentIds, setDeletedAssignmentIds] = useState<Set<string>>(new Set());

  const classroom = state.classes.find((cls) => cls.id === classId);
  // Filter assignments: only show non-submitted and non-deleted ones for students
  const classAssignments = state.assignments.filter((assignment) => {
    if (assignment.classId !== classId) return false;
    if (deletedAssignmentIds.has(assignment.id)) return false;
    // Students don't see submitted/graded assignments in their view
    if (currentRole === 'student' && (assignment.status === 'submitted' || assignment.status === 'graded')) return false;
    return true;
  });

  const handleFileSelect = (assignmentId: string, files: FileList | null) => {
    if (!files) return;
    setAssignmentFiles((prev) => ({
      ...prev,
      [assignmentId]: [...(prev[assignmentId] || []), ...Array.from(files)],
    }));
  };

  const handleRemoveFile = (assignmentId: string, fileName: string) => {
    setAssignmentFiles((prev) => ({
      ...prev,
      [assignmentId]: (prev[assignmentId] || []).filter((f) => f.name !== fileName),
    }));
  };

  const handleUploadFiles = async (assignmentId: string) => {
    const files = assignmentFiles[assignmentId] || [];
    if (files.length === 0) return;

    setUploadingAssignmentId(assignmentId);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAssignmentFiles((prev) => ({
        ...prev,
        [assignmentId]: [],
      }));
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingAssignmentId(null);
    }
  };

  if (!classroom) {
    return (
      <div className="rounded-[2rem] border border-border-subtle bg-white/5 p-10 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-text-muted">Class not found</p>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">This classroom could not be found.</h1>
        <button type="button" onClick={() => navigate('/app/classes')} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:brightness-110">
          <ChevronLeft className="h-4 w-4" />
          Back to Classes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <button type="button" onClick={() => navigate('/app/classes')} className="flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-text-primary">
          <ChevronLeft className="h-4 w-4" />
          Back to classes
        </button>
      </div>

      {/* Class Header */}
      <section className={metricClass}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl" style={{ backgroundColor: classroom.color }} />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{classroom.subject}</p>
                <h1 className="mt-1 text-3xl font-semibold text-text-primary">{classroom.title}</h1>
              </div>
            </div>
            <p className="text-text-secondary mb-4">{classroom.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Section</p>
                <p className="mt-1 font-medium text-text-primary">{classroom.section}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Class Code</p>
                <p className="mt-1 font-medium text-text-primary">{classroom.code}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Learners</p>
                <p className="mt-1 font-medium text-text-primary">{classroom.students}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Resources</p>
                <p className="mt-1 font-medium text-text-primary">{classroom.resourceCount}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Progress</p>
            <p className="mt-2 text-4xl font-semibold text-text-primary">{classroom.progress}%</p>
            <div className="mt-3">
              <ProgressBar value={classroom.progress} />
            </div>
          </div>
        </div>
      </section>

      {/* Assignments */}
      <ShellSection title="Class assignments" subtitle={`${classAssignments.length} active assignments for ${classroom.title}`}>
        {classAssignments.length === 0 ? (
          <div className="rounded-3xl border border-border-subtle bg-black/10 p-5 text-sm text-text-secondary text-center">
            No assignments yet for this class.
          </div>
        ) : (
          <div className="space-y-3">
            {classAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-border-subtle bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-text-primary">{assignment.title}</p>
                      <ViewPill label={assignment.kind} />
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{assignment.dueDate}</p>
                    <p className="mt-2 text-sm text-text-secondary">{assignment.description}</p>
                  </div>
                  <ViewPill label={assignment.status} />
                </div>
                {/* Delete button for completed assignments */}
                {(assignment.status === 'submitted' || assignment.status === 'graded') && state.currentUser?.role === 'student' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setDeletedAssignmentIds((prev) => new Set([...prev, assignment.id]))}
                      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Submissions</p>
                    <p className="mt-1 font-semibold text-text-primary">{assignment.submissions}</p>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Average</p>
                    <p className="mt-1 font-semibold text-text-primary">{assignment.averageScore}/{assignment.maxPoints}</p>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-black/10 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Plagiarism</p>
                    <p className="mt-1 font-semibold text-text-primary">{assignment.aiPlagiarismScore}%</p>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressBar value={assignment.maxPoints ? (assignment.averageScore / assignment.maxPoints) * 100 : 0} />
                </div>

                {/* File Upload Section */}
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border-2 border-dashed border-border-subtle bg-black/10 p-4">
                    <label className="block">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileSelect(assignment.id, e.target.files)}
                        className="hidden"
                      />
                      <div className="cursor-pointer text-center">
                        <p className="text-sm font-medium text-text-secondary">+ Add files to this assignment</p>
                        <p className="mt-1 text-xs text-text-muted">Click to upload or drag and drop</p>
                      </div>
                    </label>
                  </div>

                  {/* Selected Files */}
                  {(assignmentFiles[assignment.id] || []).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.24em] text-text-muted">
                        {(assignmentFiles[assignment.id] || []).length} file(s) selected
                      </p>
                      {(assignmentFiles[assignment.id] || []).map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-border-subtle bg-black/20 p-2 text-sm"
                        >
                          <span className="text-text-secondary">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(assignment.id, file.name)}
                            className="text-xs text-text-muted transition hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleUploadFiles(assignment.id)}
                        disabled={uploadingAssignmentId === assignment.id}
                        className="w-full rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
                      >
                        {uploadingAssignmentId === assignment.id ? 'Uploading...' : 'Upload Files'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ShellSection>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="rounded-[2rem] border border-border-subtle bg-white/5 p-10 text-center">
      <p className="text-sm uppercase tracking-[0.24em] text-text-muted">Page not found</p>
      <h1 className="mt-3 text-3xl font-semibold text-text-primary">The requested view does not exist.</h1>
    </div>
  );
}
