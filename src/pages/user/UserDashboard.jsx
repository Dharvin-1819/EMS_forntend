import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const STATS_CONFIG = [
  { key: 'tickets',  label: 'Active Tickets',  cardClass: 'card-orange', color: '#AD974F', link: '/user/tickets'      },
  { key: 'attended', label: 'Events Attended', cardClass: 'card-orange', color: '#AD974F', link: '/user/history'       },
  { key: 'alerts',   label: 'Unread Alerts',   cardClass: 'card-orange', color: '#AD974F', link: '/user/notifications' },
  { key: 'reviews',  label: 'Reviews Given',   cardClass: 'card-orange', color: '#AD974F', link: '/user/feedback'      },
];

export default function UserDashboard() {
  const { currentUser } = useSelector(s => s.auth);
  const { tickets } = useSelector(s => s.tickets);
  const { events } = useSelector(s => s.events);
  const { notifications } = useSelector(s => s.notifications);
  const { feedbacks } = useSelector(s => s.feedback);

  const isMyTicket = (t) => {
    if (!currentUser) return false;
    if (String(t.userId || t.user?.id) === String(currentUser.id)) return true;
    if (currentUser.email && (t.user?.email === currentUser.email || (currentUser.email === 'user@eventpro.com' && (t.userId === 'u3' || t.userId === 3)))) return true;
    return false;
  };

  const myTickets      = tickets.filter(isMyTicket);
  const activeTickets  = myTickets.filter(t => t.status === 'active');
  const upcomingEventIds = activeTickets.map(t => String(t.eventId || t.event?.id));
  const upcomingEvents = events.filter(e => upcomingEventIds.includes(String(e.id)) && !e.isPast).slice(0, 3);
  const unread         = notifications.filter(n => (String(n.userId) === String(currentUser?.id) || n.userId === 'all' || (currentUser?.email === 'user@eventpro.com' && n.userId === 'u3')) && !n.read);
  const myFeedbacks    = feedbacks.filter(f => String(f.userId) === String(currentUser?.id));

  const statValues = {
    tickets:  activeTickets.length,
    attended: myTickets.filter(t => t.status === 'used').length,
    alerts:   unread.length,
    reviews:  myFeedbacks.length,
  };

  const getFirstName = () => {
    let name = currentUser?.name;
    if (!name || name.includes('@')) {
      name = (name || currentUser?.email || 'User').split('@')[0];
    }
    const first = name.trim().split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#ffffff' }}>Welcome back,</span>
            <span style={{ color: 'var(--brand, #AD974F)' }}>{getFirstName()}</span>
          </h1>
          <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
            {currentUser?.role === 'admin'
              ? 'Attendee Mode · Personal activity & bookings'
              : currentUser?.role === 'organizer'
              ? 'Attendee Mode · Personal activity & bookings'
              : "Here's an overview of your activity"}
          </p>
        </div>
        {(currentUser?.role === 'organizer' || currentUser?.role === 'admin') && (
          <div className="flex gap-sm items-center">
            {currentUser?.role === 'admin' && (
              <Link to="/admin/dashboard">
                <button className="btn btn-outline font-black uppercase text-xs" style={{ borderColor: 'var(--brand, #AD974F)', color: 'var(--brand, #AD974F)' }}>
                  Admin Hub
                </button>
              </Link>
            )}
            <Link to="/organizer/dashboard">
              <button className="btn btn-primary font-black uppercase text-xs" style={{ background: 'var(--grad-primary)' }}>
                Organizer Hub
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid-4 mb-xl">
        {STATS_CONFIG.map(s => (
          <Link to={s.link} key={s.key} style={{ textDecoration: 'none' }}>
            <div className={`card ${s.cardClass} p-lg`} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div className="text-xs font-black uppercase" style={{ color: '#ffffff', opacity: 0.9 }}>{s.label}</div>
                <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
              </div>
              <div className="text-3xl font-black" style={{ color: '#ffffff' }}>{statValues[s.key]}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid-2">
        {/* Upcoming Events */}
        <div className="card" style={{ borderColor: 'rgba(173,151,79,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-md)', paddingBottom: 'var(--s-md)', borderBottom: '1px solid rgba(173,151,79,0.2)' }}>
            <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Upcoming Events</h3>
            <Link to="/events">
              <button className="btn btn-outline btn-sm font-black uppercase">Browse</button>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingEvents.length === 0 ? (
              <div style={{ padding: 'var(--s-xl)', textAlign: 'center' }}>
                <div className="text-xs font-black uppercase mb-md" style={{ color: '#ffffff', opacity: 0.8 }}>No upcoming plans</div>
                <Link to="/events">
                  <button className="btn btn-primary btn-sm font-black uppercase">Find Events</button>
                </Link>
              </div>
            ) : upcomingEvents.map(ev => (
              <Link to={`/events/${ev.id}`} key={ev.id} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(173,151,79,0.25)',
                  background: 'rgba(173,151,79,0.08)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'var(--transition)',
                }}>
                  <div>
                    <div className="font-black text-xs uppercase" style={{ color: '#ffffff' }}>{ev.title}</div>
                    <div className="text-xs font-semibold uppercase mt-xs" style={{ color: '#ffffff', opacity: 0.85 }}>
                      {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {ev.location}
                    </div>
                  </div>
                  <span style={{ color: '#AD974F', fontSize: '0.85rem', fontWeight: 900 }}>VIEW</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="card" style={{ borderColor: 'rgba(173,151,79,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-md)', paddingBottom: 'var(--s-md)', borderBottom: '1px solid rgba(173,151,79,0.2)' }}>
            <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Notifications</h3>
            <Link to="/user/notifications">
              <button className="btn btn-sm font-black uppercase" style={{ background: 'rgba(173,151,79,0.15)', color: '#ffffff', border: '1px solid rgba(173,151,79,0.3)' }}>See All</button>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {notifications
              .filter(n => n.userId === currentUser.id || n.userId === 'all')
              .slice(0, 5)
              .map(n => (
                <div key={n.id} style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius)',
                  background: !n.read ? 'rgba(173,151,79,0.12)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${!n.read ? 'rgba(173,151,79,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                  <div className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>{n.title}</div>
                  <div className="text-xs font-semibold truncate" style={{ color: '#ffffff', opacity: 0.85 }}>{n.message}</div>
                </div>
              ))}
            {notifications.filter(n => n.userId === currentUser.id || n.userId === 'all').length === 0 && (
              <div style={{ padding: 'var(--s-xl)', textAlign: 'center' }}>
                <div className="text-xs font-black uppercase" style={{ color: '#ffffff', opacity: 0.8 }}>No new alerts</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
