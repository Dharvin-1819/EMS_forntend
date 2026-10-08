import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const ROLE_LABEL = {
  admin: 'Administrator (All Roles)',
  organizer: 'Organizer & Attendee',
  user: 'Attendee',
};

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/events', label: 'All Events' },
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/notifications', label: 'Notifications' },
];

const organizerManagementLinks = [
  { to: '/organizer/dashboard', label: 'Organizer Overview' },
  { to: '/organizer/create-event', label: 'Create Event' },
  { to: '/organizer/events', label: 'My Events' },
  { to: '/organizer/registrations', label: 'Registrations' },
  { to: '/organizer/reports', label: 'Business Reports' },
];

const attendeePersonalLinks = [
  { to: '/events', label: 'Explore Events' },
  { to: '/user/tickets', label: 'My Booked Tickets' },
  { to: '/user/history', label: 'Booking History' },
  { to: '/user/feedback', label: 'Feedback & Reviews' },
  { to: '/user/notifications', label: 'Notifications' },
  { to: '/user/dashboard', label: 'Attendee Hub' },
];

const userLinks = [
  { to: '/user/dashboard', label: 'Dashboard' },
  { to: '/events', label: 'Browse Events' },
  { to: '/user/tickets', label: 'My Tickets' },
  { to: '/user/history', label: 'History' },
  { to: '/user/notifications', label: 'Notifications' },
  { to: '/user/feedback', label: 'Feedback' },
];

export default function Sidebar({ onNavigate }) {
  const { currentUser, allUsers } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const role = currentUser?.role;
  const pendingCount = role === 'admin'
    ? (allUsers || []).filter(u => u.status === 'pending').length
    : 0;

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    navigate('/');
  };

  const renderNavLinks = (linkList) => (
    linkList.map(({ to, label }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
        title={label}
      >
        <span>{label}</span>
        {label === 'User Management' && pendingCount > 0 && (
          <span className="nav-badge" aria-label={`${pendingCount} pending approvals`}>
            {pendingCount}
          </span>
        )}
      </NavLink>
    ))
  );

  return (
    <aside className="sidebar" id="app-sidebar">
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-brand"
          onClick={() => { navigate('/'); onNavigate?.(); }}
          aria-label="EventPro home"
        >
          <span>EventPro</span>
        </button>
      </div>

      {currentUser && (() => {
        let name = currentUser?.name;
        if (!name || name.includes('@')) {
          name = (name || currentUser?.email || 'User').split('@')[0];
        }
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <div className="sidebar-user">
            <div className="avatar" aria-hidden="true">
              {formattedName[0]?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-meta">
              <div className="sidebar-user-name">{formattedName}</div>
              <div className="sidebar-user-role" style={{ color: 'var(--brand, #AD974F)', fontWeight: 800 }}>
                {ROLE_LABEL[role] || role}
              </div>
            </div>
          </div>
        );
      })()}

      <nav className="sidebar-nav" aria-label="Main navigation">
        {/* Organizer Dual Role: Shows Organizer Management AND Attendee/Personal tools */}
        {role === 'organizer' && (
          <>
            <div className="sidebar-section">Organizer Tools</div>
            {renderNavLinks(organizerManagementLinks)}

            <div className="sidebar-section" style={{ marginTop: 16 }}>Attendee / Personal</div>
            {renderNavLinks(attendeePersonalLinks)}
          </>
        )}

        {/* Regular Attendee Menu */}
        {role === 'user' && (
          <>
            <div className="sidebar-section">Attendee Menu</div>
            {renderNavLinks(userLinks)}
          </>
        )}

        {/* Admin Menu: Full multi-role access (Admin, Organizer & Attendee) */}
        {role === 'admin' && (
          <>
            <div className="sidebar-section">Admin Administration</div>
            {renderNavLinks(adminLinks)}

            <div className="sidebar-section" style={{ marginTop: 16 }}>Organizer Tools</div>
            {renderNavLinks(organizerManagementLinks)}

            <div className="sidebar-section" style={{ marginTop: 16 }}>Attendee / Personal</div>
            {renderNavLinks(attendeePersonalLinks)}
          </>
        )}

        <div className="sidebar-section" style={{ marginTop: 16 }}>Quick links</div>
        <NavLink
          to="/"
          onClick={onNavigate}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          title="Homepage"
        >
          <span>Homepage</span>
        </NavLink>
        <NavLink
          to="/events"
          onClick={onNavigate}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          title="Browse Events"
        >
          <span>Public Event Catalog</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={handleLogout}
          id="sidebar-logout-btn"
        >
          <span className="sidebar-collapse-label">Log out</span>
        </button>
      </div>
    </aside>
  );
}
