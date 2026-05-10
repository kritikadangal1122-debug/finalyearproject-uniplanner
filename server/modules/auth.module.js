import { getJwtSecret, hashPassword, signJwt } from '../security.js';
import { store } from '../store.js';
import { toPublicUser } from '../types.js';
import { API_PREFIX, createJsonRoute, requireAuth } from '../http.js';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export const registerAuthModule = (app) => {
  app.get(`${API_PREFIX}/health`, createJsonRoute((_req, res) => {
    res.json({
      ok: true,
      service: 'learning-os-api',
      version: '1.0.0',
      secretConfigured: Boolean(getJwtSecret()),
      timestamp: new Date().toISOString(),
    });
  }));

  app.get(`${API_PREFIX}/meta`, createJsonRoute((_req, res) => {
    res.json({
      modules: ['auth', 'classes', 'assignments', 'collaboration', 'analytics', 'notifications', 'ai', 'storage'],
      capabilities: ['jwt-auth', 'role-based-access', 'real-time-ready', 'file-storage-ready', 'ai-assistance', 'sse-streams'],
      database: 'postgresql',
      cache: 'redis',
      storage: 's3-compatible',
      realtime: 'sse/websocket-ready',
    });
  }));

  app.post(`${API_PREFIX}/auth/login`, createJsonRoute((req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = store.findUserByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const { token, expiresAt } = signJwt({ sub: user.id, role: user.role }, SESSION_TTL_MS);
    store.recordSession({
      token,
      userId: user.id,
      role: user.role,
      issuedAt: Date.now(),
      expiresAt,
    });

    store.createAnalyticsEvent('auth', 'login_success', { role: user.role }, user.id);

    res.json({
      token,
      expiresAt,
      user: toPublicUser(user),
    });
  }));

  app.get(`${API_PREFIX}/auth/me`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;

    res.json({
      user: auth.user,
      role: auth.role,
      permissions: store.getSnapshot().permissions.filter((permission) => permission.userId === auth.user.id),
    });
  }));
};
