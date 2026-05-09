import { STORAGE_KEY } from './lmsData';
import type {
  AnalyticsSnapshot,
  AppState,
  Role,
  UserAccount,
} from './types';

export interface LoginResult {
  token: string;
  expiresAt: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    title: string;
    avatar: string;
    bio: string;
    locale: string;
    xp: number;
    badges: string[];
  };
}

export type PublicUserAccount = Omit<UserAccount, 'passwordHash'>;

export interface PublicAppState extends Omit<AppState, 'users'> {
  users: PublicUserAccount[];
}

export interface DashboardStateResponse {
  app: PublicAppState;
  session: {
    token: string;
    userId: string;
    role: Role;
  } | null;
}

export interface AnalyticsOverviewResponse {
  role: Role;
  analytics: AnalyticsSnapshot;
  health: {
    score: number;
    uptime: string;
    activeUsers: number;
    openClasses: number;
    pendingActions: number;
  };
  nextBestAction: {
    title: string;
    reason: string;
    action: string;
    priority: 'high' | 'normal' | 'low';
    entityType: string;
    entityId: string;
  };
}

export interface WidgetOrderResponse {
  ok: true;
  state: DashboardStateResponse;
}

const API_BASE = '/api';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { session?: { token?: string } };
    return parsed.session?.token ?? null;
  } catch {
    return null;
  }
};

const authHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...jsonHeaders,
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? 'Request failed');
  }

  return data as T;
}

export interface UploadResourceResponse {
  resource: {
    id: string;
    classId: string;
    name: string;
    type: string;
    size: string;
    preview: string;
    fileUrl: string;
    updatedAt: string;
  };
}

export interface UploadSubmissionResponse {
  submission: {
    id: string;
    assignmentId: string;
    studentId: string;
    contentText: string;
    fileUrl: string;
    fileName: string;
    submittedAt: string;
  };
}

const uploadRequest = async <T>(path: string, formData: FormData): Promise<T> => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? 'Upload failed');
  return data as T;
};

export const api = {
  login: (email: string, password: string) => request<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  health: () => request('/health'),
  state: () => request<DashboardStateResponse>('/state', {
    headers: authHeaders(),
  }),
  analyticsOverview: () => request<AnalyticsOverviewResponse>('/analytics/overview', {
    headers: authHeaders(),
  }),
  updateWidgetOrder: (widgetOrder: string[]) => request<WidgetOrderResponse>('/preferences/widget-order', {
    method: 'PUT',
    body: JSON.stringify({ widgetOrder }),
    headers: authHeaders(),
  }),
  nextBestAction: (userId: string, token: string) => request(`/insights/next-best-action/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),
  uploadResource: (formData: FormData) =>
    uploadRequest<UploadResourceResponse>('/upload/resource', formData),
  uploadSubmission: (formData: FormData) =>
    uploadRequest<UploadSubmissionResponse>('/upload/submission', formData),
  deleteSubmission: (submissionId: string) =>
    request<{ ok: boolean }>(`/submissions/${submissionId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }),
  gradeSubmission: (submissionId: string, score: number, feedback: string) =>
    request<{ ok: boolean }>(`/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      body: JSON.stringify({ score, feedback }),
      headers: authHeaders(),
    }),
};
