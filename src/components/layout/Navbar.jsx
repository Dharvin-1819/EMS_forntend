import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { markAllAsRead } from '../../features/notifications/notificationsSlice';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Navbar({ hasSidebar = false }) {
  const { currentUser, isAuthenticated } = useSelector(s => s.auth);
  const { notifications } = useSelector(s => s.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unread = notifications.filter(n =>
    (n.userId === 'all' || String(n.userId) === String(currentUser?.id) || (currentUser?.email === 'user@eventpro.com' && (n.userId === 'u3' || n.userId === 3))) && !n.read
  );

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    navigate('/');
  };

  const roleDashboard = {
    admin: '/admin/dashboard',
    organizer: '/organizer/dashboard',
    user: '/user/dashboard',
  };

  return (
    <nav className={`navbar ${hasSidebar ? 'with-sidebar' : ''}`}>
      <div className="flex items-center justify-between w-full h-full p-md">
        <div className="flex items-center">
          {!hasSidebar && (
            <Link to="/" className="text-xl font-black uppercase gradient-text">
              EVENTPRO
            </Link>
          )}
          {hasSidebar && (
            <span className="text-xs font-black uppercase" style={{ color: '#ffffff', letterSpacing: '0.08em' }}>
              {currentUser?.role === 'admin' ? 'ADMINISTRATION' : currentUser?.role === 'organizer' ? 'MANAGEMENT' : 'USER CONTROL'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-md">
          {!isAuthenticated && (
            <>
              <Link to="/events"><button className="btn btn-secondary btn-sm font-black uppercase">EXPLORE</button></Link>
              <Link to="/login"><button className="btn btn-secondary btn-sm font-black uppercase">LOGIN</button></Link>
              <Link to="/register"><button className="btn btn-primary btn-sm font-black uppercase">GET STARTED</button></Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <div style={{ position: 'relative' }}>
                <button
                  className="btn-text"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  id="notif-btn"
                  style={{ color: '#ffffff' }}
                >
                  <span className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Notifications</span>
                  {unread.length > 0 && (
                    <span className="badge badge-primary" style={{
                      position: 'absolute', top: -10, right: -12,
                      fontSize: '0.72rem', padding: '2px 6px', borderRadius: 4
                    }}>{unread.length}</span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="card" style={{
                    position: 'absolute', right: 0, top: 40, width: 320, padding: 0, zIndex: 1000,
                    background: '#231F20', border: '1px solid #AD974F', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}>
                    <div className="flex justify-between items-center p-md" style={{ borderBottom: '1px solid rgba(173,151,79,0.3)' }}>
                      <span className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Recent Activity</span>
                      <button className="text-xs font-black uppercase" style={{ color: '#AD974F' }}
                        onClick={() => { dispatch(markAllAsRead(currentUser.id)); setShowNotifDropdown(false); }}>
                        CLEAR
                      </button>
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {notifications.filter(n => n.userId === 'all' || String(n.userId) === String(currentUser?.id) || (currentUser?.email === 'user@eventpro.com' && (n.userId === 'u3' || n.userId === 3))).slice(0, 5).map(n => (
                        <div key={n.id} className="p-md" style={{ borderBottom: '1px solid rgba(173,151,79,0.2)', background: n.read ? 'transparent' : 'rgba(173,151,79,0.1)', cursor: 'pointer' }}
                          onClick={() => { dispatch(markAllAsRead(currentUser.id)); setShowNotifDropdown(false); navigate('/user/notifications'); }}>
                          <div className="text-xs font-black uppercase mb-xs" style={{ color: '#ffffff' }}>{n.title}</div>
                          <div className="text-xs" style={{ color: '#ffffff', opacity: 0.9, lineHeight: 1.4 }}>{n.message.slice(0, 60)}...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {currentUser?.role === 'admin' ? (
                <>
                  <Link to="/admin/dashboard">
                    <button className="btn-text text-xs font-black uppercase" style={{ color: 'var(--brand, #AD974F)' }}>Admin Hub</button>
                  </Link>
                  <Link to="/organizer/dashboard">
                    <button className="btn-text text-xs font-black uppercase" style={{ color: '#ffffff' }}>Organizer Hub</button>
                  </Link>
                  <Link to="/user/tickets">
                    <button className="btn-text text-xs font-black uppercase" style={{ color: '#ffffff' }}>My Tickets</button>
                  </Link>
                  <Link to="/events">
                    <button className="btn-text text-xs font-black uppercase" style={{ color: '#ffffff' }}>Explore</button>
                  </Link>
                </>
              ) : currentUser?.role === 'organizer' ? (
                <>
                  <Link to="/organizer/dashboard">
                    <button className="btn-text text-xs font-black uppercase" style={{ color: 'var(--brand, #AD974F)' }}>Organizer Hub</button>
                  </Link>
                  <Link to="/user/tickets">
                    <button className="btn-text text-xs font-black uppercase" style={{ color: '#ffffff' }}>My Tickets</button>
                  </Link>
                  <Link to="/events">
                    <button className="btn-text text-xs font-black uppercase" style={{ color: '#ffffff' }}>Explore</button>
                  </Link>
                </>
              ) : (
                <Link to={roleDashboard[currentUser?.role] || '/'}>
                  <button className="btn-text text-xs font-black uppercase" style={{ color: '#ffffff' }}>Dashboard</button>
                </Link>
              )}

              <div className="flex-center font-black text-xs" style={{
                width: 32, height: 32, borderRadius: 'var(--radius)',
                background: '#231F20', border: '1px solid #AD974F',
                color: '#AD974F'
              }}>
                {currentUser?.name?.[0]?.toUpperCase()}
              </div>

              <button className="btn-text text-xs font-black uppercase" style={{ color: '#dc2626' }} onClick={handleLogout}>
                LOGOUT
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

