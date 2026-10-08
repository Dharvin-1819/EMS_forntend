import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ANALYTICS_DATA } from '../../data/mockData';
import { Link } from 'react-router-dom';

const COLORS = ['#AD974F', '#8E793E', '#231F20', '#EAEAEA'];

export default function AdminDashboard() {
  const { allUsers } = useSelector(s => s.auth);
  const { events } = useSelector(s => s.events);
  const { tickets } = useSelector(s => s.tickets);

  const totalRevenue = tickets.reduce((s, t) => s + (t.price || 0), 0);
  const admins = allUsers.filter(u => u.role === 'admin').length;
  const organizers = allUsers.filter(u => u.role === 'organizer').length;
  const users = allUsers.filter(u => u.role === 'user').length;
  const pending = allUsers.filter(u => u.status === 'pending').length;

  const stats = [
    { label: 'TOTAL USERS',  value: allUsers.length,                       color: '#AD974F', cardClass: 'card-orange', link: '/admin/users'     },
    { label: 'EVENTS',       value: events.length,                         color: '#AD974F', cardClass: 'card-orange', link: '/admin/events'    },
    { label: 'TICKET SALES', value: tickets.length,                        color: '#AD974F', cardClass: 'card-orange', link: '/admin/events'    },
    { label: 'REVENUE',      value: `₹${(totalRevenue/1000).toFixed(0)}K`, color: '#AD974F', cardClass: 'card-orange', link: '/admin/analytics' },
  ];

  const roleData = [
    { name: 'Admins',     value: admins },
    { name: 'Organizers', value: organizers },
    { name: 'Users',      value: users },
  ];

  return (
    <DashboardLayout>
      <div className="mb-xl flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Platform Intelligence</h1>
          <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>Top-level metrics and administration tools</p>
        </div>
        <div className="flex gap-sm items-center flex-wrap">
          <Link to="/organizer/dashboard">
            <button className="btn btn-outline font-black uppercase text-xs" style={{ borderColor: '#AD974F', color: '#AD974F' }}>
              Organizer Hub
            </button>
          </Link>
          <Link to="/user/dashboard">
            <button className="btn btn-outline font-black uppercase text-xs" style={{ borderColor: 'var(--brand, #AD974F)', color: '#ffffff' }}>
              Attendee Dashboard
            </button>
          </Link>
          <Link to="/organizer/create-event">
            <button className="btn btn-primary font-black uppercase text-xs" style={{ background: 'var(--grad-primary)' }}>
              Create Event
            </button>
          </Link>
        </div>
      </div>

      {pending > 0 && (
        <div className="card mb-xl" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-md)', borderColor: '#AD974F' }}>
          <div style={{ flex: 1 }}>
            <div className="text-sm font-black uppercase" style={{ color: '#ffffff' }}>{pending} Account{pending > 1 ? 's' : ''} Pending Approval</div>
            <div className="text-xs" style={{ color: '#ffffff', opacity: 0.85 }}>New users are waiting for your review before they can access the platform.</div>
          </div>
          <Link to="/admin/users">
            <button className="btn btn-primary btn-sm font-black uppercase">Review Now</button>
          </Link>
        </div>
      )}

      <div className="grid-4 mb-xl">
        {stats.map(s => (
          <Link to={s.link} key={s.label} style={{ textDecoration: 'none' }}>
            <div className={`card ${s.cardClass} p-lg`} style={{ cursor: 'pointer' }}>
              <div className="text-xs font-black uppercase mb-sm" style={{ color: '#ffffff', opacity: 0.9 }}>{s.label}</div>
              <div className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>{s.value}</div>
              <div className="text-xs font-black uppercase mt-xs" style={{ color: '#AD974F' }}>+ GROWTH 12%</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid-2 mb-xl">
        {/* Monthly Revenue */}
        <div className="card">
          <div className="p-md flex justify-between items-center" style={{ borderBottom: '1px solid rgba(173,151,79,0.2)' }}>
            <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Financial Health</h3>
            <Link to="/admin/analytics">
              <button className="btn btn-secondary btn-sm font-black uppercase">Full Data</button>
            </Link>
          </div>
          <div className="p-lg" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ANALYTICS_DATA.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#ffffff', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#ffffff', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
                <Tooltip 
                   contentStyle={{ background: '#231F20', border: '1px solid #AD974F', borderRadius: 4, color: '#ffffff' }} 
                   itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#ffffff' }}
                   formatter={(v) => `₹${v.toLocaleString()}`} 
                />
                <Line type="monotone" dataKey="revenue" stroke="#AD974F" strokeWidth={4} dot={false} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Roles */}
        <div className="card">
          <div className="p-md flex justify-between items-center" style={{ borderBottom: '1px solid rgba(173,151,79,0.2)' }}>
            <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>User Demographics</h3>
          </div>
          <div className="p-lg" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#231F20', border: '1px solid #AD974F', borderRadius: 4, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#ffffff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card p-0">
        <div className="p-md flex justify-between items-center" style={{ borderBottom: '1px solid rgba(173,151,79,0.2)' }}>
          <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Recent Global Activity</h3>
          <Link to="/admin/events">
            <button className="btn btn-secondary btn-sm font-black uppercase">Audit All</button>
          </Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr className="text-xs font-black uppercase">
                <th style={{ color: '#ffffff' }}>Event</th><th style={{ color: '#ffffff' }}>Organizer</th><th style={{ color: '#ffffff' }}>Category</th><th style={{ color: '#ffffff' }}>Date</th><th style={{ color: '#ffffff' }}>Scale</th><th style={{ color: '#ffffff' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 6).map(ev => (
                <tr key={ev.id} className="text-xs font-semibold uppercase">
                  <td>
                    <Link to={`/events/${ev.id}`} className="font-black" style={{ color: '#ffffff' }}>{ev.title}</Link>
                  </td>
                  <td style={{ color: '#ffffff' }}>{ev.organizerName}</td>
                  <td><span className="text-xs font-black uppercase" style={{ color: '#ffffff', opacity: 0.9 }}>{ev.category}</span></td>
                  <td style={{ color: '#ffffff' }}>{new Date(ev.date).toLocaleDateString()}</td>
                  <td className="font-black" style={{ color: '#ffffff' }}>{ev.registered} / {ev.capacity}</td>
                  <td>
                    <span className={`badge ${ev.isPast ? 'badge-info' : 'badge-primary'} font-black text-xs`}>
                      {ev.isPast ? 'PAST' : 'ACTIVE'}
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

