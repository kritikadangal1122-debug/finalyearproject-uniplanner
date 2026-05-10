import { STORAGE_KEY } from './data.js';

const API_BASE = '/api';

function getStoredToken() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw)?.session?.token ?? null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? 'Request failed');
  return data;
}

async function uploadRequest(path, formData) {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? 'Upload failed');
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  health: () => request('/health'),
  state: () => request('/state', { headers: authHeaders() }),
  analyticsOverview: () => request('/analytics/overview', { headers: authHeaders() }),
  updateWidgetOrder: (widgetOrder) => request('/preferences/widget-order', {
    method: 'PUT',
    body: JSON.stringify({ widgetOrder }),
    headers: authHeaders(),
  }),
  uploadResource: (formData) => uploadRequest('/upload/resource', formData),
  uploadSubmission: (formData) => uploadRequest('/upload/submission', formData),
  deleteSubmission: (id) => request(`/submissions/${id}`, { method: 'DELETE', headers: authHeaders() }),
  gradeSubmission: (id, score, feedback) => request(`/submissions/${id}/grade`, {
    method: 'PATCH',
    body: JSON.stringify({ score, feedback }),
    headers: authHeaders(),
  }),
  getAssignmentFeedback: (submissionText, rubric) => request('/ai/assignment-feedback', {
    method: 'POST',
    body: JSON.stringify({ submissionText, rubric }),
    headers: authHeaders(),
  }),
};
