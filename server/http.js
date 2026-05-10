import { randomUUID } from 'crypto';
import { store } from './store.js';
import { verifyJwt } from './security.js';

export const API_PREFIX = '/api';

export const createJsonRoute = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
};

export const requireAuth = (req, res) => {
  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token.' });
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();
  const payload = verifyJwt(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return null;
  }

  const session = store.getSession(token);
  if (!session || session.expiresAt <= Date.now()) {
    res.status(401).json({ error: 'Session has expired.' });
    return null;
  }

  const user = store.findUserById(session.userId);
  if (!user) {
    res.status(401).json({ error: 'Unknown user.' });
    return null;
  }

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatar: user.avatar,
      bio: user.bio,
      locale: user.locale,
      xp: user.xp,
      badges: user.badges,
    },
    role: user.role,
  };
};

export const requireRole = (auth, roles) => roles.includes(auth.role);

export const createClassCode = () => `NX-${Math.floor(1000 + Math.random() * 8999)}`;

export const classColor = () => {
  const palette = ['#3b82f6', '#7c3aed', '#0f766e', '#f59e0b', '#db2777'];
  return palette[Math.floor(Math.random() * palette.length)];
};

export const mentionsFromMessage = (message) => {
  const matches = message.match(/@([a-zA-Z0-9_]+)/g) ?? [];
  return matches.map((item) => item.slice(1));
};

export const getCurrentSnapshot = () => store.getSnapshot();
