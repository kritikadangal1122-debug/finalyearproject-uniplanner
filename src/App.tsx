import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { LmsProvider, useLms } from './context/LmsContext';
import {
  AnalyticsPage,
  AssignmentsPage,
  CalendarPage,
  ClassesPage,
  ClassDetailPage,
  CollaborationPage,
  DashboardPage,
  AdminPage,
  LoginPage,
  NotFoundPage,
  ResourcesPage,
  SettingsPage,
} from './pages/LmsPages';

function RequireAuth() {
  const { currentUser } = useLms();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

function PublicOnly() {
  const { currentUser } = useLms();

  if (currentUser) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}

function RoleGate({ allow }: { allow: Array<'student' | 'teacher' | 'admin'> }) {
  const { currentRole } = useLms();

  if (!currentRole || !allow.includes(currentRole)) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const { currentUser } = useLms();

  return <Navigate to={currentUser ? '/app' : '/login'} replace />;
}

export default function App() {
  return (
    <LmsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/app" element={<Layout><Outlet /></Layout>}>
              <Route index element={<DashboardPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="classes/:classId" element={<ClassDetailPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="collaboration" element={<CollaborationPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route element={<RoleGate allow={[ 'admin' ]} />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LmsProvider>
  );
}
