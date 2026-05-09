import type express from 'express';
import { hashPassword } from '../security';
import { store } from '../store';
import { API_PREFIX, createJsonRoute, requireAuth, requireRole } from '../http';
import { randomUUID } from 'crypto';

export const registerAdminModule = (app: express.Express) => {
  // Get all users
  app.get(`${API_PREFIX}/admin/users`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    if (!requireRole(auth, ['admin'])) {
      res.status(403).json({ error: 'Only admins can view users.' });
      return;
    }

    const snapshot = store.getSnapshot();
    const users = snapshot.app.users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatar: user.avatar,
      bio: user.bio,
      xp: user.xp,
      badges: user.badges,
    }));

    res.json({ users });
  }));

  // Create a new user
  app.post(`${API_PREFIX}/admin/users`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    if (!requireRole(auth, ['admin'])) {
      res.status(403).json({ error: 'Only admins can create users.' });
      return;
    }

    const { name, email, password, role, title, bio, avatar } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      title?: string;
      bio?: string;
      avatar?: string;
    };

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Name, email, password, and role are required.' });
      return;
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Role must be student, teacher, or admin.' });
      return;
    }

    const snapshot = store.getSnapshot();
    if (snapshot.app.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      res.status(409).json({ error: 'User with this email already exists.' });
      return;
    }

    const newUser = {
      id: `user-${randomUUID()}`,
      name,
      email,
      passwordHash: hashPassword(password),
      role: role as 'student' | 'teacher' | 'admin',
      title: title || '',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      bio: bio || '',
      locale: 'en',
      xp: 0,
      badges: [] as string[],
    };

    const updatedApp = {
      ...snapshot.app,
      users: [...snapshot.app.users, newUser],
    };

    store.replaceApp(updatedApp);
    store.createAnalyticsEvent('admin', 'user_created', { role: newUser.role }, auth.user.id);

    res.json({
      ok: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        title: newUser.title,
        avatar: newUser.avatar,
        bio: newUser.bio,
        xp: newUser.xp,
        badges: newUser.badges,
      },
    });
  }));

  // Update a user
  app.put(`${API_PREFIX}/admin/users/:userId`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    if (!requireRole(auth, ['admin'])) {
      res.status(403).json({ error: 'Only admins can update users.' });
      return;
    }

    const { userId } = req.params;
    const { name, email, title, bio, role } = req.body as {
      name?: string;
      email?: string;
      title?: string;
      bio?: string;
      role?: string;
    };

    const snapshot = store.getSnapshot();
    const userIndex = snapshot.app.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const existingUser = snapshot.app.users[userIndex];

    // Check if new email is already taken by another user
    if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
      if (snapshot.app.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        res.status(409).json({ error: 'User with this email already exists.' });
        return;
      }
    }

    // Validate role if provided
    if (role && !['student', 'teacher', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Role must be student, teacher, or admin.' });
      return;
    }

    const updatedUser = {
      ...existingUser,
      name: name ?? existingUser.name,
      email: email ?? existingUser.email,
      title: title ?? existingUser.title,
      bio: bio ?? existingUser.bio,
      role: (role ?? existingUser.role) as 'student' | 'teacher' | 'admin',
    };

    const updatedUsers = [...snapshot.app.users];
    updatedUsers[userIndex] = updatedUser;

    const updatedApp = {
      ...snapshot.app,
      users: updatedUsers,
    };

    store.replaceApp(updatedApp);
    store.createAnalyticsEvent('admin', 'user_updated', { role: updatedUser.role }, auth.user.id);

    res.json({
      ok: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        title: updatedUser.title,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        xp: updatedUser.xp,
        badges: updatedUser.badges,
      },
    });
  }));

  // Update user role
  app.patch(`${API_PREFIX}/admin/users/:userId/role`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    if (!requireRole(auth, ['admin'])) {
      res.status(403).json({ error: 'Only admins can grant roles.' });
      return;
    }

    const { userId } = req.params;
    const { role } = req.body as { role?: string };

    if (!role || !['student', 'teacher', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Role must be student, teacher, or admin.' });
      return;
    }

    const snapshot = store.getSnapshot();
    const userIndex = snapshot.app.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const updatedUser = {
      ...snapshot.app.users[userIndex],
      role: role as 'student' | 'teacher' | 'admin',
    };

    const updatedUsers = [...snapshot.app.users];
    updatedUsers[userIndex] = updatedUser;

    const updatedApp = {
      ...snapshot.app,
      users: updatedUsers,
    };

    store.replaceApp(updatedApp);
    store.createAnalyticsEvent('admin', 'role_granted', { oldRole: snapshot.app.users[userIndex].role, newRole: role }, auth.user.id);

    res.json({
      ok: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        title: updatedUser.title,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        xp: updatedUser.xp,
        badges: updatedUser.badges,
      },
    });
  }));

  // Delete a user
  app.delete(`${API_PREFIX}/admin/users/:userId`, createJsonRoute((req, res) => {
    const auth = requireAuth(req, res);
    if (!auth) return;
    if (!requireRole(auth, ['admin'])) {
      res.status(403).json({ error: 'Only admins can delete users.' });
      return;
    }

    const { userId } = req.params;

    const snapshot = store.getSnapshot();
    const userIndex = snapshot.app.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const deletedUser = snapshot.app.users[userIndex];

    // Prevent deleting admin user if they're the only admin
    if (deletedUser.role === 'admin') {
      const adminCount = snapshot.app.users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        res.status(400).json({ error: 'Cannot delete the last admin user.' });
        return;
      }
    }

    const updatedUsers = snapshot.app.users.filter((user) => user.id !== userId);
    const updatedApp = {
      ...snapshot.app,
      users: updatedUsers,
    };

    store.replaceApp(updatedApp);
    store.createAnalyticsEvent('admin', 'user_deleted', { role: deletedUser.role }, auth.user.id);

    res.json({ ok: true, message: `User ${deletedUser.name} has been deleted.` });
  }));
};
