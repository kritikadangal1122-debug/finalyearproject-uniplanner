import { STORAGE_KEY, createInitialState } from './data.js';

let _state = null;
const _listeners = new Set();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialState();
  try {
    const parsed = JSON.parse(raw);
    const base = createInitialState();

    // Migrate legacy single student id → user-student-1
    if (parsed.session?.userId === 'user-student') {
      parsed.session.userId = 'user-student-1';
    }
    if (parsed.users?.length) {
      const legacyStudent = parsed.users.find(u => u.id === 'user-student');
      if (legacyStudent) {
        parsed.users = parsed.users.filter(u => u.id !== 'user-student');
      }
    }

    const classes = parsed.classes?.length
      ? parsed.classes.map(c => ({ ...c, enrolledStudentIds: (c.enrolledStudentIds || []).map(id => id === 'user-student' ? 'user-student-1' : id) }))
      : base.classes;
    return {
      ...base,
      ...parsed,
      preferences: { ...base.preferences, ...parsed.preferences },
      users: parsed.users?.length
        ? parsed.users.map(u => {
            const seed = base.users.find(b => b.id === u.id);
            return seed ? { assignedSubjects: seed.assignedSubjects ?? [], ...u } : u;
          })
        : base.users,
      classes,
      assignments: parsed.assignments?.length ? parsed.assignments : base.assignments,
      submissions: parsed.submissions?.length
        ? parsed.submissions.map(s => ({ ...s, studentId: s.studentId === 'user-student' ? 'user-student-1' : s.studentId }))
        : [],
      discussions: parsed.discussions?.length ? parsed.discussions : base.discussions,
      messages: parsed.messages?.length ? parsed.messages : base.messages,
      notifications: parsed.notifications?.length ? parsed.notifications : base.notifications,
      events: parsed.events?.length ? parsed.events : base.events,
      resources: parsed.resources?.length ? parsed.resources : base.resources,
    };
  } catch {
    return createInitialState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.body.dataset.theme = theme;
}

export function getState() {
  if (!_state) _state = loadState();
  return _state;
}

export function setState(updater) {
  const prev = getState();
  _state = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
  saveState(_state);
  applyTheme(_state.preferences.theme);
  _listeners.forEach(fn => { try { fn(_state); } catch (e) { console.error('[store] subscriber error:', e); } });
}

export function subscribe(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export function getCurrentUser() {
  const state = getState();
  if (!state.session) return null;
  return state.users.find(u => u.id === state.session.userId) ?? null;
}

export function getCurrentRole() {
  return getCurrentUser()?.role ?? null;
}

function buildId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

// ── Auth ────────────────────────────────────────────────────────────────
async function sha256(value) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function signIn(email, password) {
  const state = getState();
  const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false, error: 'No account matches that email address.' };

  const hash = await sha256(password);
  if (hash !== user.passwordHash) return { ok: false, error: 'Incorrect password.' };

  setState(prev => ({
    ...prev,
    session: { token: buildId('jwt'), userId: user.id, issuedAt: Date.now() },
  }));
  return { ok: true };
}

export function signOut() {
  setState(prev => ({ ...prev, session: null }));
}

// ── Preferences ─────────────────────────────────────────────────────────
export function toggleTheme() {
  setState(prev => ({
    ...prev,
    preferences: { ...prev.preferences, theme: prev.preferences.theme === 'dark' ? 'light' : 'dark' },
  }));
}

export function setTheme(theme) {
  setState(prev => ({ ...prev, preferences: { ...prev.preferences, theme } }));
}

export function toggleSidebar() {
  setState(prev => ({
    ...prev,
    preferences: { ...prev.preferences, sidebarOpen: !prev.preferences.sidebarOpen },
  }));
}

export function setLanguage(language) {
  setState(prev => ({ ...prev, preferences: { ...prev.preferences, language } }));
}

export function setNotificationPref(key, value) {
  setState(prev => ({
    ...prev,
    preferences: {
      ...prev.preferences,
      notifications: { ...(prev.preferences.notifications ?? {}), [key]: value },
    },
  }));
}

// ── Classes ──────────────────────────────────────────────────────────────
export function createClassroom({ title, subject, section, description }) {
  const user = getCurrentUser();
  if (!user) return;
  const classroom = {
    id: buildId('class'),
    code: `NX-${Math.floor(1000 + Math.random() * 8999)}`,
    title, subject, section,
    teacherId: user.id,
    teacherName: user.name,
    color: '#3b82f6',
    description,
    students: 0,
    archived: false,
    progress: 0,
    nextDeadline: 'No deadline set',
    meetingTime: 'TBD',
    tags: [subject, section],
    sections: [{ id: buildId('section'), name: section, studentCount: 0 }],
    resourceCount: 0,
    unreadMessages: 0,
    enrolledStudentIds: [],
  };
  setState(prev => ({
    ...prev,
    classes: [classroom, ...prev.classes],
    notifications: [{ id: buildId('note'), title: 'Class created', description: `${title} is now live.`, priority: 'normal', unread: true, time: 'Just now', kind: 'class' }, ...prev.notifications],
  }));
  return classroom;
}

export function joinClassroom(code) {
  const state = getState();
  const user = getCurrentUser();
  const classroom = state.classes.find(c => c.code.toLowerCase() === code.toLowerCase().trim());
  if (!classroom) return { ok: false, error: 'Class not found.' };
  if (user && classroom.enrolledStudentIds.includes(user.id)) {
    return { ok: false, error: `You are already enrolled in ${classroom.title}.` };
  }
  setState(prev => ({
    ...prev,
    classes: prev.classes.map(c => c.id === classroom.id
      ? { ...c, students: c.students + 1, enrolledStudentIds: user ? [...c.enrolledStudentIds, user.id] : c.enrolledStudentIds }
      : c),
    notifications: [{ id: buildId('note'), title: 'Joined class', description: `You joined ${classroom.title}.`, priority: 'normal', unread: true, time: 'Just now', kind: 'enrollment' }, ...prev.notifications],
  }));
  return { ok: true };
}

export function updateClassroom(classId, updates) {
  setState(prev => ({
    ...prev,
    classes: prev.classes.map(c => c.id === classId ? { ...c, ...updates } : c),
  }));
}

export function archiveClassroom(classId) {
  setState(prev => ({ ...prev, classes: prev.classes.map(c => c.id === classId ? { ...c, archived: true } : c) }));
}

export function unarchiveClassroom(classId) {
  setState(prev => ({ ...prev, classes: prev.classes.map(c => c.id === classId ? { ...c, archived: false } : c) }));
}

// ── Assignments ──────────────────────────────────────────────────────────
export function updateAssignment(assignmentId, updates) {
  setState(prev => ({
    ...prev,
    assignments: prev.assignments.map(a => a.id === assignmentId ? { ...a, ...updates } : a),
  }));
}

export function createAssignment({ classId, title, kind, dueDate, maxPoints, description, attachmentUrl = '', attachmentName = '' }) {
  const assignment = {
    id: buildId('assignment'),
    classId, title, kind, dueDate,
    status: 'assigned',
    maxPoints: Number(maxPoints) || 100,
    submissions: 0,
    averageScore: 0,
    manualReview: kind !== 'quiz',
    aiPlagiarismScore: 0,
    description,
    attachmentUrl,
    attachmentName,
    rubric: ['Accuracy', 'Clarity', 'Timeliness'],
  };
  setState(prev => ({ ...prev, assignments: [assignment, ...prev.assignments] }));
  return assignment;
}

// ── Submissions ──────────────────────────────────────────────────────────
export function addSubmission(sub) {
  setState(prev => ({ ...prev, submissions: [sub, ...prev.submissions] }));
}

export function removeSubmission(submissionId) {
  setState(prev => ({ ...prev, submissions: prev.submissions.filter(s => s.id !== submissionId) }));
}

export function gradeSubmission(submissionId, score, feedback) {
  setState(prev => ({
    ...prev,
    submissions: prev.submissions.map(s => s.id === submissionId ? { ...s, score, teacherFeedback: feedback } : s),
  }));
}

// ── Discussions ──────────────────────────────────────────────────────────
export function createThread({ classId, author, message, role }) {
  const thread = {
    id: buildId('thread'),
    classId, author, role, message,
    time: 'Just now',
    replies: 0,
    mentions: message.includes('@') ? [message.split('@')[1].split(' ')[0]] : [],
    pinned: false,
  };
  setState(prev => ({ ...prev, discussions: [thread, ...prev.discussions] }));
}

export function sendMessage({ classId, sender, role, message }) {
  const msg = { id: buildId('message'), classId, sender, role, message, time: 'Now' };
  setState(prev => ({ ...prev, messages: [...prev.messages, msg] }));
}

// ── Notifications ────────────────────────────────────────────────────────
export function markNotificationRead(notificationId) {
  setState(prev => ({
    ...prev,
    notifications: prev.notifications.map(n => n.id === notificationId ? { ...n, unread: false } : n),
  }));
}

export function markAllNotificationsRead() {
  setState(prev => ({
    ...prev,
    notifications: prev.notifications.map(n => ({ ...n, unread: false })),
  }));
}

// ── Events ───────────────────────────────────────────────────────────────
export function createEvent({ title, classId, date, startTime, endTime, type }) {
  const event = { id: buildId('event'), title, classId, date, startTime, endTime, type, color: '#3b82f6' };
  setState(prev => ({
    ...prev,
    events: [event, ...prev.events],
    notifications: [{
      id: buildId('note'), title: `Event: ${title}`,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} on ${date}${startTime ? ' at ' + startTime : ''}`,
      priority: type === 'exam' || type === 'deadline' ? 'high' : 'normal',
      unread: true, time: 'Just now', kind: 'event', entityId: event.id,
    }, ...prev.notifications],
  }));
}

export function updateEvent(eventId, updates) {
  setState(prev => ({
    ...prev,
    events: prev.events.map(e => e.id === eventId ? { ...e, ...updates } : e),
  }));
}

export function deleteEvent(eventId) {
  setState(prev => ({ ...prev, events: prev.events.filter(e => e.id !== eventId) }));
}

// ── Resources ────────────────────────────────────────────────────────────
export function addResource({ classId, name, type, size, preview, url = '' }) {
  const resource = { id: buildId('resource'), classId, name, type, size, updatedAt: 'Just now', preview, url };
  setState(prev => ({ ...prev, resources: [resource, ...prev.resources] }));
}

// ── Admin ────────────────────────────────────────────────────────────────
export async function createUser({ name, email, password, role, title = '', bio = '', avatar = '' }) {
  const newUser = {
    id: buildId('user'),
    name, email,
    passwordHash: await sha256(password),
    role,
    title,
    avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    bio,
    locale: 'en',
    xp: 0,
    badges: [],
  };
  setState(prev => ({
    ...prev,
    users: [...prev.users, newUser],
    notifications: [{ id: buildId('note'), title: 'User created', description: `${name} (${role}) added.`, priority: 'normal', unread: true, time: 'Just now', kind: 'admin' }, ...prev.notifications],
  }));
  return newUser;
}

export function updateUser({ userId, name, email, title, bio, role, avatar }) {
  setState(prev => ({
    ...prev,
    users: prev.users.map(u => u.id === userId ? {
      ...u,
      name: name ?? u.name,
      email: email ?? u.email,
      title: title ?? u.title,
      bio: bio ?? u.bio,
      role: role ?? u.role,
      avatar: avatar !== undefined ? (avatar || u.avatar) : u.avatar,
    } : u),
  }));
}

export function updateUserSubjects(userId, subjects) {
  setState(prev => ({
    ...prev,
    users: prev.users.map(u => u.id === userId ? { ...u, assignedSubjects: subjects } : u),
  }));
}

export function deleteUser(userId) {
  const user = getState().users.find(u => u.id === userId);
  if (!user) return;
  setState(prev => ({
    ...prev,
    users: prev.users.filter(u => u.id !== userId),
    notifications: [{ id: buildId('note'), title: 'User deleted', description: `${user.name} removed.`, priority: 'normal', unread: true, time: 'Just now', kind: 'admin' }, ...prev.notifications],
  }));
}

export function updateUserRole(userId, newRole) {
  const user = getState().users.find(u => u.id === userId);
  if (!user) return;
  setState(prev => ({
    ...prev,
    users: prev.users.map(u => u.id === userId ? { ...u, role: newRole } : u),
    notifications: [{ id: buildId('note'), title: 'Role updated', description: `${user.name}'s role changed to ${newRole}.`, priority: 'normal', unread: true, time: 'Just now', kind: 'admin' }, ...prev.notifications],
  }));
}

export function resetDemoData() {
  setState(createInitialState());
}

// ── Init ─────────────────────────────────────────────────────────────────
export function initStore() {
  _state = loadState();
  applyTheme(_state.preferences.theme);
}
