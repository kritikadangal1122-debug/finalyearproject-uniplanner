export type Role = 'student' | 'teacher' | 'admin';
export type ThemeMode = 'dark' | 'light';
export type AssignmentKind = 'assignment' | 'quiz' | 'project';
export type AssignmentStatus = 'draft' | 'assigned' | 'submitted' | 'graded';
export type NotificationPriority = 'high' | 'normal' | 'low';
export type ResourceType = 'folder' | 'document' | 'video' | 'link';
export type EventType = 'class' | 'deadline' | 'exam' | 'meeting';

export interface SessionInfo {
  token: string;
  userId: string;
  issuedAt: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  avatar: string;
  bio: string;
  locale: string;
  xp: number;
  badges: string[];
  passwordHash: string;
}

export interface ClassroomSection {
  id: string;
  name: string;
  studentCount: number;
}

export interface Classroom {
  id: string;
  code: string;
  title: string;
  subject: string;
  section: string;
  teacherId: string;
  teacherName: string;
  color: string;
  description: string;
  students: number;
  archived: boolean;
  progress: number;
  nextDeadline: string;
  meetingTime: string;
  tags: string[];
  sections: ClassroomSection[];
  resourceCount: number;
  unreadMessages: number;
  enrolledStudentIds: string[];
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  kind: AssignmentKind;
  dueDate: string;
  status: AssignmentStatus;
  maxPoints: number;
  submissions: number;
  averageScore: number;
  manualReview: boolean;
  aiPlagiarismScore: number;
  description: string;
  rubric: string[];
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileName: string;
  fileUrl: string;
  notes: string;
  submittedAt: string;
  score?: number;
  teacherFeedback?: string;
}

export interface DiscussionThread {
  id: string;
  classId: string;
  author: string;
  role: Role;
  message: string;
  time: string;
  replies: number;
  mentions: string[];
  pinned: boolean;
}

export interface ChatMessage {
  id: string;
  classId: string;
  sender: string;
  role: Role;
  message: string;
  time: string;
  threadId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  priority: NotificationPriority;
  unread: boolean;
  time: string;
  kind: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: EventType;
  color: string;
}

export interface ResourceItem {
  id: string;
  classId: string;
  name: string;
  type: ResourceType;
  size: string;
  updatedAt: string;
  preview: string;
  fileUrl?: string;
}

export interface AnalyticsSnapshot {
  attendance: number;
  completion: number;
  engagement: number;
  averageGrade: number;
  streak: number;
  heatmap: number[];
  weeklyProgress: number[];
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'progress' | 'classes' | 'assignments' | 'activity' | 'assistant' | 'calendar';
}

export interface AppPreferences {
  theme: ThemeMode;
  language: string;
  sidebarOpen: boolean;
  widgetOrder: string[];
}

export interface AppState {
  session: SessionInfo | null;
  preferences: AppPreferences;
  users: UserAccount[];
  classes: Classroom[];
  assignments: Assignment[];
  submissions: StudentSubmission[];
  discussions: DiscussionThread[];
  messages: ChatMessage[];
  notifications: NotificationItem[];
  events: CalendarEvent[];
  resources: ResourceItem[];
}
