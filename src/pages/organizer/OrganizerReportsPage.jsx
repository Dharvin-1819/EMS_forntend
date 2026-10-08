import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#ffffff', '#a1a1a1', '#525252', '#333333', '#222222'];

export default function OrganizerReportsPage() {
  const { currentUser } = useSelector(s => s.auth);
  const { events } = useSelector(s => s.events);
  const { tickets } = useSelector(s => s.tickets);

  const myEvents = events.filter(e => {
    const orgId = e.organizerId || e.organizer?.id;
    const isDirectOrg = String(orgId).replace(/\D/g, '') === String(currentUser?.id).replace(/\D/g, '');
    if (isDirectOrg) return true;
    if (currentUser?.role === 'admin') return true;
    return false;
  });
  const myEventIds = myEvents.map(e => e.id);
  const myTickets = tickets.filter(t => myEventIds.includes(t.eventId));
  const totalRevenue = myTickets.reduce((sum, t) => sum + (t.price || 0), 0);

  const revenueByEvent = myEvents.map(ev => ({
    name: ev.title.split(' ').slice(0, 2).join(' ').toUpperCase(),
    revenue: myTickets.filter(t => t.eventId === ev.id).reduce((s, t) => s + (t.price || 0), 0),
  }));

  const registrationByCategory = Object.entries(
    myEvents.reduce((acc, ev) => {
      acc[ev.category] = (acc[ev.category] || 0) + ev.registered;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  return (
    <DashboardLayout>
      <div className="mb-xl">
        <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Business Reports</h1>
        <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>Financial and engagement metrics for your events</p>
      </div>

      <div className="mb-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s-md)' }}>
        {[
          { label: 'GROSS REVENUE', value: `₹${totalRevenue.toLocaleString()}`, color: 'var(--text)' },
          { label: 'TICKETS SOLD', value: myTickets.length, color: 'var(--text)' },
          { label: 'ATTENDEES', value: myEvents.reduce((s, e) => s + e.registered, 0).toLocaleString(), color: 'var(--text)' },
          { label: 'OCCUPANCY', value: `${myEvents.length ? Math.round(myEvents.reduce((s, e) => s + e.registered / e.capacity, 0) / myEvents.length * 100) : 0}%`, color: 'var(--text)' },
        ].map(s => (
          <div key={s.label} className="card p-md">
            <div className="text-xs font-black uppercase mb-xs" style={{ color: 'var(--text-faint)' }}>{s.label}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-black uppercase mt-xs" style={{ color: 'var(--success)' }}>+8.2% PERIOD</div>
          </div>
        ))}
      </div>

      <div className="grid-2 gap-xl">
        <div className="card">
          <div className="p-md" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Financial Yield</h3>
          </div>
          <div className="p-lg" style={{ height: 280 }}>
            {myEvents.length === 0 ? (
              <div className="flex-center h-full text-xs font-black uppercase" style={{ color: 'var(--text-faint)' }}>No Event Data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByEvent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-faint)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 900 }} itemStyle={{ color: 'var(--text)' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="var(--text)" radius={[2,2,0,0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-md" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Category Distribution</h3>
          </div>
          <div className="p-lg" style={{ height: 280 }}>
            {registrationByCategory.length === 0 ? (
              <div className="flex-center h-full text-xs font-black uppercase" style={{ color: 'var(--text-faint)' }}>No Category Data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={registrationByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {registrationByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 900 }} itemStyle={{ color: 'var(--text)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

