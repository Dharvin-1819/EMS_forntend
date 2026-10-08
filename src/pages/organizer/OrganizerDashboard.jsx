import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATS_CONFIG = [
  { key: 'events',        label: 'Total Events',  cardClass: 'card-orange', color: '#AD974F' },
  { key: 'registrations', label: 'Registrations', cardClass: 'card-orange', color: '#AD974F' },
  { key: 'revenue',       label: 'Revenue',        cardClass: 'card-orange', color: '#AD974F' },
  { key: 'rating',        label: 'Avg Rating',     cardClass: 'card-orange', color: '#AD974F' },
];

export default function OrganizerDashboard() {
  const { currentUser } = useSelector(s => s.auth);
  const { events }  = useSelector(s => s.events);
  const { tickets } = useSelector(s => s.tickets);

  const myEvents           = events.filter(e => {
    const orgId = e.organizerId || e.organizer?.id;
    const isDirectOrg = String(orgId).replace(/\D/g, '') === String(currentUser?.id).replace(/\D/g, '');
    if (isDirectOrg) return true;
    if (currentUser?.role === 'admin' && !events.some(ev => String(ev.organizerId || ev.organizer?.id).replace(/\D/g, '') === String(currentUser?.id).replace(/\D/g, ''))) {
      return true;
    }
    return false;
  });
  const totalRegistrations = myEvents.reduce((sum, e) => sum + e.registered, 0);
  const totalRevenue       = tickets.filter(t => myEvents.some(e => e.id === t.eventId)).reduce((sum, t) => sum + t.price, 0);
  const avgRating          = myEvents.filter(e => e.rating > 0).reduce((sum, e, _, arr) => sum + e.rating / arr.length, 0);

  const statValues = {
    events:        myEvents.length,
    registrations: totalRegistrations.toLocaleString(),
    revenue:       `₹${(totalRevenue / 100).toFixed(0)}K`,
    rating:        avgRating.toFixed(1) || '—',
  };

  const chartData = myEvents.map(e => ({
    name:       e.title.split(' ').slice(0, 2).join(' '),
    registered: e.registered,
    capacity:   e.capacity,
  }));

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-xl)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Organizer Overview</h1>
          <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
            {currentUser?.role === 'admin' ? 'Administrator Mode · Organizer Control & Event Management' : 'Manage your events and track performance'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {currentUser?.role === 'admin' && (
            <Link to="/admin/dashboard">
              <button className="btn btn-outline font-black uppercase text-xs" style={{ borderColor: 'var(--brand, #AD974F)', color: 'var(--brand, #AD974F)' }}>
                Admin Hub
              </button>
            </Link>
          )}
          <Link to="/user/tickets">
            <button className="btn btn-outline font-black uppercase text-xs" style={{ borderColor: 'var(--brand, #AD974F)', color: 'var(--brand, #AD974F)' }}>
              My Booked Tickets
            </button>
          </Link>
          <Link to="/events">
            <button className="btn btn-outline font-black uppercase text-xs" style={{ borderColor: '#ffffff', color: '#ffffff' }}>
              Explore Events
            </button>
          </Link>
          <Link to="/organizer/create-event">
            <button className="btn btn-primary font-black uppercase text-xs" id="create-event-btn"
              style={{ background: 'var(--grad-primary)' }}>
              Create Event
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-xl">
        {STATS_CONFIG.map(s => (
          <div key={s.key} className={`card ${s.cardClass} p-lg`}>
            <div className="text-xs font-black uppercase mb-sm" style={{ color: '#ffffff', opacity: 0.9 }}>{s.label}</div>
            <div className="text-3xl font-black" style={{ color: '#ffffff' }}>{statValues[s.key]}</div>
          </div>
        ))}
      </div>

      {/* Registration Chart */}
      <div className="card mb-xl" style={{ borderColor: 'rgba(173,151,79,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-lg)', paddingBottom: 'var(--s-md)', borderBottom: '1px solid rgba(173,151,79,0.2)' }}>
          <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Registration Activity</h3>
          <Link to="/organizer/reports">
            <button className="btn btn-sm font-black uppercase" style={{ background: 'rgba(173,151,79,0.15)', color: '#ffffff', border: '1px solid rgba(173,151,79,0.3)' }}>Full Report</button>
          </Link>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#ffffff', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#231F20', border: '1px solid #AD974F', borderRadius: 8, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff' }} itemStyle={{ fontWeight: 900, color: '#ffffff' }} />
              <Bar dataKey="capacity"   fill="rgba(173,151,79,0.2)" radius={[4,4,0,0]} name="Capacity"    />
              <Bar dataKey="registered" fill="#AD974F"                 radius={[4,4,0,0]} name="Registered" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events Table */}
      <div className="card p-0" style={{ borderColor: 'rgba(173,151,79,0.3)' }}>
        <div style={{ padding: 'var(--s-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(173,151,79,0.2)' }}>
          <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Active Events</h3>
          <Link to="/organizer/events">
            <button className="btn btn-outline btn-sm font-black uppercase">View All</button>
          </Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr className="text-xs font-black uppercase">
                <th style={{ color: '#ffffff' }}>Event</th><th style={{ color: '#ffffff' }}>Date</th><th style={{ color: '#ffffff' }}>Category</th><th style={{ color: '#ffffff' }}>Registrations</th><th style={{ color: '#ffffff' }}>Revenue</th><th style={{ color: '#ffffff' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myEvents.slice(0, 5).map(ev => (
                <tr key={ev.id} className="text-xs font-semibold uppercase">
                  <td>
                    <Link to={`/events/${ev.id}`} className="font-black" style={{ color: '#ffffff' }}>{ev.title}</Link>
                  </td>
                  <td style={{ color: '#ffffff' }}>{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td>
                    <span className="badge badge-purple">{ev.category}</span>
                  </td>
                  <td style={{ color: '#ffffff' }}>
                    <div className="font-black">{ev.registered} / {ev.capacity}</div>
                    <div style={{ marginTop: 4, width: 80, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(ev.registered / ev.capacity * 100)}%`, height: '100%', background: 'linear-gradient(90deg,#AD974F,#8E793E)' }} />
                    </div>
                  </td>
                  <td className="font-black" style={{ color: '#ffffff' }}>₹{(ev.registered * ev.price / 1000).toFixed(1)}K</td>
                  <td>
                    <span className={`badge ${ev.isPast ? 'badge-blue' : 'badge-success'} text-xs font-black`}>
                      {ev.isPast ? 'PAST' : 'LIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
