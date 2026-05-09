import { useState } from 'react';
import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';

const titleMap: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/classes': 'Classes',
  '/app/assignments': 'Assignments',
  '/app/collaboration': 'Collaboration',
  '/app/calendar': 'Calendar',
  '/app/resources': 'Resources',
  '/app/analytics': 'Analytics',
  '/app/settings': 'Settings',
  '/app/admin': 'Admin',
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, currentRole, signOut, state, toggleSidebar, toggleTheme, markNotificationRead } = useLms();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = state.notifications.filter((notification) => notification.unread).length;
  const title = titleMap[location.pathname] ?? 'Workspace';

  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-[var(--panel)]/92 backdrop-blur-2xl">
      <div className="flex min-h-[4.75rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4">
          <button type="button" onClick={toggleSidebar} className="rounded-2xl border border-border-subtle p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Nexus LMS</p>
            <h1 className="mt-1 text-2xl font-semibold text-text-primary">{title}</h1>
          </div>
          <div className="flex-1" />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((previous) => !previous)}
              aria-expanded={notificationsOpen}
              aria-label="Open notifications"
              className="relative rounded-2xl border border-border-subtle p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
            >
            <Bell className="h-5 w-5" />
              {unreadCount ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--panel)]" /> : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-full z-30 mt-3 w-80 overflow-hidden rounded-3xl border border-border-subtle bg-[var(--panel)] shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                  <p className="text-sm font-semibold text-text-primary">Notifications</p>
                  <button type="button" onClick={() => navigate('/app/settings')} className="text-xs font-medium text-primary hover:underline">
                    Settings
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                  {state.notifications.length ? (
                    state.notifications.slice(0, 5).map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          markNotificationRead(notification.id);
                          setNotificationsOpen(false);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 ${notification.unread ? 'bg-primary/10' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
                            <p className="mt-1 text-sm text-text-secondary">{notification.description}</p>
                          </div>
                          {notification.unread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-sm text-text-secondary">No notifications yet.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <button type="button" onClick={toggleTheme} className="rounded-2xl border border-border-subtle p-2 text-text-secondary transition hover:border-primary/40 hover:text-text-primary">
            {state.preferences.theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button type="button" onClick={signOut} className="hidden items-center gap-2 rounded-2xl border border-border-subtle px-3 py-2 text-sm text-text-secondary transition hover:border-red-500/40 hover:text-red-200 sm:flex">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-border-subtle bg-white/5 px-3 py-2 lg:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-text-primary">{currentUser?.name}</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">{currentRole}</p>
            </div>
            <img src={currentUser?.avatar} alt={currentUser?.name ?? 'User'} className="h-10 w-10 rounded-xl object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
