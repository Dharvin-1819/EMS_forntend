import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import { fetchEventsAsync } from './features/events/eventsSlice';
import { fetchUsersAsync } from './features/auth/authSlice';
import { fetchTicketsAsync } from './features/tickets/ticketsSlice';
import './styles/global.css';
import EventAIChatbot from './components/common/EventAIChatbot';

// Guest pages
import LandingPage from './pages/guest/LandingPage';
import LoginPage from './pages/guest/LoginPage';
import RegisterPage from './pages/guest/RegisterPage';
import PendingApprovalPage from './pages/guest/PendingApprovalPage';
import EventListPage from './pages/guest/EventListPage';
import EventDetailPage from './pages/guest/EventDetailPage';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import MyTicketsPage from './pages/user/MyTicketsPage';
import NotificationsPage from './pages/user/NotificationsPage';
import FeedbackPage from './pages/user/FeedbackPage';
import HistoryPage from './pages/user/HistoryPage';

// Organizer pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEventPage from './pages/organizer/CreateEventPage';
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage';
import ManageRegistrationsPage from './pages/organizer/ManageRegistrationsPage';
import OrganizerReportsPage from './pages/organizer/OrganizerReportsPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

// Protected Route
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, currentUser } = useSelector(s => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Block pending/rejected non-admin accounts
  if (currentUser?.role !== 'admin' && currentUser?.status !== 'approved') {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}



function AppRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEventsAsync());
    dispatch(fetchUsersAsync());
    dispatch(fetchTicketsAsync());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />
      <Route path="/events" element={<EventListPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />

      {/* User / Attendee Routes (accessible to attendees, organizers, and admins) */}
      <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/tickets" element={<ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}><MyTicketsPage /></ProtectedRoute>} />
      <Route path="/user/notifications" element={<ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}><NotificationsPage /></ProtectedRoute>} />
      <Route path="/user/feedback" element={<ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}><FeedbackPage /></ProtectedRoute>} />
      <Route path="/user/history" element={<ProtectedRoute allowedRoles={['user', 'organizer', 'admin']}><HistoryPage /></ProtectedRoute>} />

      {/* Organizer (accessible to organizers and admins) */}
      <Route path="/organizer/dashboard" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerDashboard /></ProtectedRoute>} />
      <Route path="/organizer/create-event" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><CreateEventPage /></ProtectedRoute>} />
      <Route path="/organizer/events" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerEventsPage /></ProtectedRoute>} />
      <Route path="/organizer/registrations" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><ManageRegistrationsPage /></ProtectedRoute>} />
      <Route path="/organizer/reports" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerReportsPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute allowedRoles={['admin']}><AdminEventsPage /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><AdminNotificationsPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#13152a',
              color: '#e2e4f3',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#06d6a0', secondary: '#13152a' } },
            error: { iconTheme: { primary: '#ef476f', secondary: '#13152a' } },
          }}
        />
        <AppRoutes />
        <EventAIChatbot />
      </BrowserRouter>
    </Provider>
  );
}
