import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  PlayCircle,
  ArrowUpRight,
  MoreVertical,
} from 'lucide-react';
import { api, type AnalyticsOverviewResponse, type DashboardStateResponse } from '../lib/api';

const fallbackStats = [
  { label: 'Courses Completed', value: '12', change: 4, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Learning Hours', value: '128h', change: 12, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Resources Accessed', value: '45', change: 2, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { label: 'Current Progress', value: '78%', change: 5, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<DashboardStateResponse | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
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
  const currentUser = app?.users.find((user) => user.id === snapshot?.session?.userId) ?? null;
  const analytics = overview?.analytics;
  const stats = analytics
    ? [
        { label: 'Courses Completed', value: `${app?.classes.filter((item) => !item.archived).length ?? 0}`, change: analytics.completion, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Learning Hours', value: `${Math.round(analytics.engagement * 1.6)}h`, change: analytics.engagement, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Resources Accessed', value: `${app?.resources.length ?? 0}`, change: analytics.attendance, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Current Progress', value: `${analytics.completion}%`, change: analytics.streak, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      ]
    : fallbackStats;

  const activeCourses = (app?.classes ?? [])
    .filter((item) => !item.archived)
    .slice(0, 2);
  const upcomingEvents = (app?.events ?? []).slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent p-8">
        <div className="relative z-10 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 text-4xl font-display font-bold text-white"
          >
            Welcome back, {currentUser?.name.split(' ')[0] ?? 'Learner'}.
          </motion.h2>
          <p className="mb-6 text-lg leading-relaxed text-text-secondary">
            You have {analytics ? `${analytics.completion}%` : 'steady'} completion across your current workload.
            {overview?.nextBestAction ? ` ${overview.nextBestAction.title}.` : ''}
          </p>
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/app/classes')} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark">
              <PlayCircle className="h-5 w-5" />
              Continue Learning
            </button>
            <button type="button" onClick={() => navigate('/app/calendar')} className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10">
              View Schedule
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-secondary/20 blur-[60px]" />
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-elevated group rounded-2xl p-6 transition-all hover:border-primary/30"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`${stat.bg} rounded-xl p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="flex items-center rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500">
                <ArrowUpRight className="mr-0.5 h-3 w-3" />
                {typeof stat.change === 'number' ? `${Math.round(stat.change)}%` : stat.change}
              </span>
            </div>
            <p className="mb-1 text-sm font-medium text-text-muted">{stat.label}</p>
            <h3 className="text-2xl font-bold tracking-tight text-white">{stat.value}</h3>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <section className="space-y-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white">Active Courses</h3>
            <button type="button" onClick={() => navigate('/app/classes')} className="text-sm font-semibold text-primary hover:underline">View All</button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {activeCourses.map((course) => (
              <div key={course.id} className="glass group flex flex-col overflow-hidden rounded-2xl border border-border-subtle transition-all hover:shadow-2xl">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop&${course.id}`}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute left-4 top-4">
                    <span className="rounded bg-primary/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      Ongoing
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h4 className="mb-1 text-lg font-bold text-white transition-colors group-hover:text-primary">{course.title}</h4>
                  <p className="mb-6 flex items-center gap-1.5 text-sm text-text-muted">
                    <span className="h-1 w-1 rounded-full bg-text-muted" />
                    {course.subject} · {course.section}
                  </p>

                  <div className="mt-auto space-y-3">
                    <div className="mb-1 flex items-end justify-between text-xs">
                      <span className="font-medium text-text-secondary">Course Progress</span>
                      <span className="font-bold text-white">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        {course.students} Learners
                      </span>
                      <button type="button" aria-label={`Open ${course.title}`} onClick={() => navigate('/app/classes')} className="rounded-lg bg-white/5 p-2 text-white transition-all hover:bg-primary hover:text-white">
                        <PlayCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xl font-display font-bold text-white">Upcoming Events</h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => navigate('/app/calendar')}
                aria-label={`Open ${event.title} in calendar`}
                className="glass group flex w-full items-center gap-4 rounded-xl border-l-4 border-l-primary/30 p-4 text-left transition-all hover:bg-white/[0.05]"
              >
                <div className="min-w-[50px] text-center">
                  <p className="text-[10px] uppercase font-bold text-text-muted">{event.date}</p>
                  <p className="text-sm font-bold text-white">{event.startTime}</p>
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-white transition-colors group-hover:text-primary">{event.title}</h5>
                  <p className="text-xs text-text-muted">{event.type}</p>
                </div>
                <span className="text-text-muted transition-colors group-hover:text-white" aria-hidden="true">
                  <MoreVertical className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary/40 to-primary/40 p-6">
            <div className="relative z-10">
              <h4 className="mb-1 text-lg font-bold text-white">Platform Health</h4>
              <p className="mb-4 text-xs text-white/70">
                {overview
                  ? `${overview.health.activeUsers} active users, ${overview.health.openClasses} open classes, ${overview.health.pendingActions} pending actions.`
                  : 'Loading platform summary.'}
              </p>
              <button type="button" onClick={() => navigate('/app/analytics')} className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-bg-main transition-transform hover:scale-105">
                Open Insights
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-transform group-hover:scale-150" />
          </div>
        </section>
      </div>
    </div>
  );
}
