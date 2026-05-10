import {
  getState, getCurrentUser, getCurrentRole,
  signOut, toggleTheme, toggleSidebar,
  markNotificationRead, markAllNotificationsRead, initStore, subscribe,
} from './store.js';

// ── Page-title map ──────────────────────────────────────────────────────
const STATIC_TITLES = {
  'dashboard.html': 'Dashboard',
  'collaboration.html': 'Discussions',
  'calendar.html': 'Calendar',
  'resources.html': 'Resources',
  'settings.html': 'Settings',
  'admin.html': 'User Management',
};

const ROLE_TITLES = {
  'classes.html': { student: 'My Courses', teacher: 'My Classes', admin: 'All Classes' },
  'class-detail.html': { student: 'Course Detail', teacher: 'Class Detail', admin: 'Class Detail' },
  'assignments.html': { student: 'Assignments', teacher: 'Grade Center', admin: 'Assignment Overview' },
  'analytics.html': { student: 'My Grades', teacher: 'Class Analytics', admin: 'Platform Analytics' },
  'grading.html': { teacher: 'SpeedGrader', admin: 'SpeedGrader' },
};

function getPageName() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function getPageTitle(role) {
  const page = getPageName();
  if (ROLE_TITLES[page] && role && ROLE_TITLES[page][role]) return ROLE_TITLES[page][role];
  return STATIC_TITLES[page] ?? 'Workspace';
}

// ── Nav items per role ───────────────────────────────────────────────────
const NAV = {
  student: [
    { icon: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
    { icon: 'book', label: 'My Courses', href: 'classes.html' },
    { icon: 'assignment', label: 'Assignments', href: 'assignments.html' },
    { icon: 'emoji_events', label: 'My Grades', href: 'analytics.html' },
    { icon: 'calendar_today', label: 'Calendar', href: 'calendar.html' },
    { icon: 'folder_open', label: 'Resources', href: 'resources.html' },
    { icon: 'forum', label: 'Discussions', href: 'collaboration.html' },
    { icon: 'settings', label: 'Settings', href: 'settings.html' },
  ],
  teacher: [
    { icon: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
    { icon: 'school', label: 'My Classes', href: 'classes.html' },
    { icon: 'assignment', label: 'Assignments', href: 'assignments.html' },
    { icon: 'edit_note', label: 'SpeedGrader', href: 'grading.html' },
    { icon: 'calendar_today', label: 'Schedule', href: 'calendar.html' },
    { icon: 'folder_open', label: 'Resources', href: 'resources.html' },
    { icon: 'bar_chart', label: 'Class Analytics', href: 'analytics.html' },
    { icon: 'forum', label: 'Discussions', href: 'collaboration.html' },
    { icon: 'settings', label: 'Settings', href: 'settings.html' },
  ],
  admin: [
    { icon: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
    { icon: 'group', label: 'User Management', href: 'admin.html' },
    { icon: 'bar_chart', label: 'Platform Analytics', href: 'analytics.html' },
    { icon: 'book', label: 'All Classes', href: 'classes.html' },
    { icon: 'assignment', label: 'Assignments', href: 'assignments.html' },
    { icon: 'calendar_today', label: 'Calendar', href: 'calendar.html' },
    { icon: 'shield', label: 'System Settings', href: 'settings.html' },
  ],
};

const ROLE_BADGE = {
  student: 'role-student',
  teacher: 'role-teacher',
  admin: 'role-admin',
};

const ROLE_LABEL = { student: 'Student', teacher: 'Educator', admin: 'Administrator' };

// ── Sidebar HTML ─────────────────────────────────────────────────────────
function buildSidebar(user, role) {
  const navItems = (NAV[role] ?? NAV.student);
  const page = getPageName();

  const links = navItems.map(item => {
    const active = page === item.href ? 'active' : '';
    return `<a href="${item.href}" class="nav-link ${active}">
      <span class="material-symbols-outlined">${item.icon}</span>
      <span>${item.label}</span>
    </a>`;
  }).join('');

  return `
    <div class="flex items-center justify-between gap-3 p-4 border-b border-[var(--app-border-subtle)]">
      <div class="flex items-center gap-3 min-w-0">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg">
          <span class="material-symbols-outlined text-xl">rocket_launch</span>
        </div>
        <div class="min-w-0">
          <h1 class="text-base font-semibold tracking-tight text-text-primary">UniPlanner</h1>
          <p class="text-[10px] uppercase tracking-widest text-text-muted">Next-gen planner</p>
        </div>
      </div>
      <button id="sidebar-close-btn" class="btn-ghost lg:hidden" aria-label="Close sidebar">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>

    <div class="px-4 py-4 border-b border-[var(--app-border-subtle)]">
      <div class="flex items-center gap-3 rounded-2xl border border-[var(--app-border-subtle)] bg-white/5 p-3">
        <img src="${user.avatar}" alt="${user.name}" class="h-10 w-10 shrink-0 rounded-xl object-cover" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}'" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-text-primary">${user.name}</p>
          <p class="truncate text-xs text-text-secondary">${user.title}</p>
          <span class="badge mt-1 ${ROLE_BADGE[role] ?? ''}">${ROLE_LABEL[role] ?? role}</span>
        </div>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">${links}</nav>

    <div class="border-t border-[var(--app-border-subtle)] p-3">
      <button id="signout-btn" class="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-text-secondary transition hover:bg-red-500/10 hover:text-red-300">
        <span class="material-symbols-outlined">logout</span>
        <span class="font-medium">Logout</span>
      </button>
    </div>
  `;
}

// ── Topbar HTML ──────────────────────────────────────────────────────────
function buildTopbar(user, role, state) {
  const title = getPageTitle(role);
  const unread = state.notifications.filter(n => n.unread).length;
  const theme = state.preferences.theme;

  return `
    <div class="flex min-h-[3.25rem] items-center justify-between gap-2 px-3 py-2 sm:px-5 lg:px-7">
      <div class="flex flex-1 items-center gap-2">
        <button id="sidebar-open-btn" class="btn-ghost lg:hidden" aria-label="Toggle sidebar">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="hidden lg:block">
          <p class="text-[9px] uppercase tracking-widest text-text-muted">UniPlanner</p>
          <h1 class="mt-0.5 text-xl font-semibold text-text-primary">${title}</h1>
        </div>
        <div class="flex-1"></div>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- Notifications -->
        <div class="relative">
          <button id="notif-btn" class="btn-ghost relative" aria-label="Open notifications">
            <span class="material-symbols-outlined">notifications</span>
            ${unread ? '<span class="notif-dot"></span>' : ''}
          </button>
          <div id="notif-panel" class="hidden absolute right-0 top-full z-30 mt-2 w-80 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--panel)] shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between border-b border-[var(--app-border-subtle)] px-4 py-3">
              <p class="text-sm font-semibold text-text-primary">Notifications${unread ? ` <span class="ml-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] text-white">${unread}</span>` : ''}</p>
              ${unread ? `<button id="mark-all-read-btn" class="text-xs font-medium text-primary hover:underline">Mark all read</button>` : `<a href="settings.html" class="text-xs font-medium text-primary hover:underline">Settings</a>`}
            </div>
            <div class="max-h-80 overflow-y-auto p-2" id="notif-list">
              ${buildNotifItems(state.notifications.slice(0, 8))}
            </div>
            ${state.notifications.length === 0 ? '' : `<div class="border-t border-[var(--app-border-subtle)] px-4 py-2"><p class="text-xs text-text-muted text-center">${state.notifications.length} total notification${state.notifications.length !== 1 ? 's' : ''}</p></div>`}
          </div>
        </div>

        <!-- Theme toggle -->
        <button id="theme-btn" class="btn-ghost" aria-label="Toggle theme">
          <span class="material-symbols-outlined">${theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>

        <!-- Sign out (desktop) -->
        <button id="topbar-signout-btn" class="btn-ghost hidden sm:flex items-center gap-2">
          <span class="material-symbols-outlined" style="font-size:16px">logout</span>
          <span class="text-sm">Sign out</span>
        </button>

        <!-- User chip (desktop) -->
        <div class="hidden lg:flex items-center gap-3 rounded-2xl border border-[var(--app-border-subtle)] bg-white/5 px-3 py-2">
          <div class="text-right">
            <p class="text-sm font-semibold text-text-primary">${user.name}</p>
            <p class="text-[10px] uppercase tracking-widest font-semibold ${role === 'admin' ? 'text-violet-400' : role === 'teacher' ? 'text-emerald-400' : 'text-blue-400'}">${ROLE_LABEL[role] ?? role}</p>
          </div>
          <img src="${user.avatar}" alt="${user.name}" class="h-9 w-9 rounded-xl object-cover" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}'" />
        </div>
      </div>
    </div>
  `;
}

const NOTIF_KIND_META = {
  deadline:   { icon: 'schedule',       color: 'text-amber-400',  bg: 'bg-amber-500/10',  href: 'assignments.html' },
  feedback:   { icon: 'rate_review',    color: 'text-emerald-400',bg: 'bg-emerald-500/10',href: 'grading.html' },
  integration:{ icon: 'cable',          color: 'text-blue-400',   bg: 'bg-blue-500/10',   href: 'settings.html' },
  class:      { icon: 'school',         color: 'text-violet-400', bg: 'bg-violet-500/10', href: 'classes.html' },
  enrollment: { icon: 'login',          color: 'text-blue-400',   bg: 'bg-blue-500/10',   href: 'classes.html' },
  event:      { icon: 'event',          color: 'text-sky-400',    bg: 'bg-sky-500/10',    href: 'calendar.html' },
  admin:      { icon: 'admin_panel_settings', color: 'text-purple-400', bg: 'bg-purple-500/10', href: 'admin.html' },
};

function buildNotifItems(notifications) {
  if (!notifications.length) return '<p class="px-4 py-5 text-center text-sm text-text-secondary">No notifications yet.</p>';
  return notifications.map(n => {
    const meta = NOTIF_KIND_META[n.kind] ?? { icon: 'notifications', color: 'text-text-muted', bg: 'bg-white/5', href: '#' };
    const priorityDot = n.priority === 'high' ? 'bg-red-500' : 'bg-blue-500';
    return `
    <a class="notif-item flex items-start gap-3 w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5 ${n.unread ? 'bg-blue-500/5' : ''}" data-id="${n.id}" href="${meta.href}">
      <div class="h-8 w-8 shrink-0 rounded-xl ${meta.bg} flex items-center justify-center mt-0.5">
        <span class="material-symbols-outlined text-[15px] ${meta.color}">${meta.icon}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-text-primary leading-tight">${escHtml(n.title)}</p>
        <p class="mt-0.5 text-xs text-text-secondary line-clamp-2">${escHtml(n.description)}</p>
        ${n.time ? `<p class="mt-1 text-[10px] text-text-muted">${escHtml(n.time)}</p>` : ''}
      </div>
      ${n.unread ? `<span class="mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDot} inline-block"></span>` : ''}
    </a>`;
  }).join('');
}

// ── Toast ────────────────────────────────────────────────────────────────
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const colors = { success: 'border-emerald-500/30 bg-emerald-500/10', error: 'border-red-500/30 bg-red-500/10', info: '' };
  toast.className = `toast ${colors[type] ?? ''}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3100);
}

// ── Helpers ──────────────────────────────────────────────────────────────
export function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function progressBar(value) {
  return `<div class="progress-bar"><div class="progress-fill" style="width:${Math.min(value,100)}%"></div></div>`;
}

export function viewPill(label) {
  return `<span class="view-pill">${escHtml(label)}</span>`;
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

// ── Auth guard ───────────────────────────────────────────────────────────
export function requireAuth() {
  initStore();
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

export function requireRole(allowedRoles) {
  if (!requireAuth()) return false;
  const role = getCurrentRole();
  if (!allowedRoles.includes(role)) {
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

export function redirectIfAuth() {
  initStore();
  const user = getCurrentUser();
  if (user) { window.location.href = 'dashboard.html'; return true; }
  return false;
}

// ── Init layout ──────────────────────────────────────────────────────────
export function initLayout() {
  if (!requireAuth()) return;

  const user = getCurrentUser();
  const role = getCurrentRole();
  const state = getState();

  const sidebarEl = document.getElementById('sidebar');
  const topbarEl = document.getElementById('topbar');

  if (sidebarEl) sidebarEl.innerHTML = buildSidebar(user, role);
  if (topbarEl) topbarEl.innerHTML = buildTopbar(user, role, state);

  attachLayoutEvents();

  subscribe(() => {
    const u = getCurrentUser();
    if (!u) { window.location.href = 'login.html'; return; }
    const r = getCurrentRole();
    const s = getState();
    if (topbarEl) topbarEl.innerHTML = buildTopbar(u, r, s);
    attachTopbarEvents();
  });
}

function attachLayoutEvents() {
  attachSidebarEvents();
  attachTopbarEvents();
}

function attachSidebarEvents() {
  document.getElementById('sidebar-close-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.add('closed');
    document.getElementById('sidebar-overlay')?.classList.remove('visible');
  });
  document.getElementById('signout-btn')?.addEventListener('click', () => {
    signOut();
    window.location.href = 'login.html';
  });
}

function attachTopbarEvents() {
  document.getElementById('sidebar-open-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('closed');
    document.getElementById('sidebar-overlay')?.classList.add('visible');
  });
  document.getElementById('theme-btn')?.addEventListener('click', () => {
    toggleTheme();
  });
  document.getElementById('topbar-signout-btn')?.addEventListener('click', () => {
    signOut();
    window.location.href = 'login.html';
  });

  // Notifications
  const notifBtn = document.getElementById('notif-btn');
  const notifPanel = document.getElementById('notif-panel');
  notifBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel?.classList.toggle('hidden');
  });
  document.addEventListener('click', () => notifPanel?.classList.add('hidden'));

  document.querySelectorAll('.notif-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (id) markNotificationRead(id);
      notifPanel?.classList.add('hidden');
    });
  });

  document.getElementById('mark-all-read-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    markAllNotificationsRead();
    notifPanel?.classList.add('hidden');
  });

  // Sidebar overlay close
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.add('closed');
    document.getElementById('sidebar-overlay')?.classList.remove('visible');
  });
}

// ── Page skeleton HTML (used in each page) ───────────────────────────────
export function pageShell(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UniPlanner</title>
  <link rel="stylesheet" href="css/theme.css" />
  <script>
    window.tailwind = { config: {
      theme: { extend: { colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: '#f59e0b',
        'bg-main': 'var(--app-bg)',
        'bg-surface': 'var(--app-surface)',
        'bg-elevated': 'var(--app-elevated)',
        'text-primary': 'var(--app-text-primary)',
        'text-secondary': 'var(--app-text-secondary)',
        'text-muted': 'var(--app-text-muted)',
        'border-subtle': 'var(--app-border-subtle)',
        'border-normal': 'var(--app-border-normal)',
      }}}
    }};
  <\/script>
  <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body>
  <aside id="sidebar" class="sidebar closed"></aside>
  <div id="sidebar-overlay" class="sidebar-overlay"></div>
  <div class="main-content">
    <header id="topbar" class="topbar"></header>
    <main id="page-content" class="page-inner">${content}</main>
  </div>
  <div id="toast-container" class="toast-container"></div>
</body>
</html>`;
}
