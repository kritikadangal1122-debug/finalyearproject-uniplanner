import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import admin from 'firebase-admin';

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'server', 'data', 'learning-os.json');
const loadedFromEnvFiles = new Set();

const parseEnvFile = (filePath) => {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, 'utf8');

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['\"]|['\"]$/g, '');

    if (key in process.env && !loadedFromEnvFiles.has(key)) continue;

    process.env[key] = value;
    loadedFromEnvFiles.add(key);
  }
};

const sanitizeForFirebase = (value) => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(sanitizeForFirebase);
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sanitizeForFirebase(entry)]),
    );
  }
  return value;
};

const loadSnapshot = () => {
  if (!existsSync(DATA_FILE)) {
    throw new Error(`Data file not found: ${DATA_FILE}`);
  }

  return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
};

const getDatabaseUrl = () => {
  const rawUrl = process.env.FIREBASE_DATABASE_URL ?? 'https://unip-996b0-default-rtdb.firebaseio.com';
  return rawUrl.replace(/\/+$/, '');
};

const getServiceAccountPath = () => process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

const initAdmin = () => {
  const serviceAccountPath = getServiceAccountPath();
  if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is required for Firebase Admin SDK auth.');
  }
  if (!existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found: ${serviceAccountPath}`);
  }

  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: getDatabaseUrl(),
    });
  }

  return admin.database();
};

const buildPayload = (snapshot) => {
  const app = snapshot.app ?? {};

  return sanitizeForFirebase({
    migrated_at: new Date().toISOString(),
    source: 'server/data/learning-os.json',
    counts: {
      users: Array.isArray(app.users) ? app.users.length : 0,
      classes: Array.isArray(app.classes) ? app.classes.length : 0,
      assignments: Array.isArray(app.assignments) ? app.assignments.length : 0,
      discussions: Array.isArray(app.discussions) ? app.discussions.length : 0,
      messages: Array.isArray(app.messages) ? app.messages.length : 0,
      notifications: Array.isArray(app.notifications) ? app.notifications.length : 0,
      events: Array.isArray(app.events) ? app.events.length : 0,
      resources: Array.isArray(app.resources) ? app.resources.length : 0,
      submissions: Array.isArray(snapshot.submissions) ? snapshot.submissions.length : 0,
      analyticsEvents: Array.isArray(snapshot.analyticsEvents) ? snapshot.analyticsEvents.length : 0,
      sessions: Array.isArray(snapshot.sessions) ? snapshot.sessions.length : 0,
      goals: Array.isArray(snapshot.goals) ? snapshot.goals.length : 0,
      permissions: Array.isArray(snapshot.permissions) ? snapshot.permissions.length : 0,
    },
    data: snapshot,
  });
};

const main = async () => {
  parseEnvFile(path.join(ROOT, '.env'));
  parseEnvFile(path.join(ROOT, '.env.local'));

  const dryRun = process.argv.includes('--dry-run');
  const snapshot = loadSnapshot();
  const payload = buildPayload(snapshot);

  console.log('[migrate] Prepared full Firebase payload:', payload.counts);

  if (dryRun) {
    console.log('[migrate] Dry run complete. No data sent to Firebase.');
    return;
  }

  const db = initAdmin();
  await db.ref('learning_os').set(payload);
  console.log('[migrate] Firebase upload complete at /learning_os.');
};

main().catch((error) => {
  console.error('[migrate] Failed:', error.message);
  process.exitCode = 1;
});
