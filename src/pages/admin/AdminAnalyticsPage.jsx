import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ANALYTICS_DATA } from '../../data/mockData';

const COLORS = ['#ffffff', '#a1a1a1', '#525252', '#333333', '#222222'];

export default function AdminAnalyticsPage() {
  const { events } = useSelector(s => s.events);
  const { tickets } = useSelector(s => s.tickets);
  const { allUsers } = useSelector(s => s.auth);

  const totalRevenue = tickets.reduce((s, t) => s + (t.price || 0), 0);

  return (
    <DashboardLayout>
      <div className="mb-xl">
        <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Platform Analytics</h1>
        <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>Deep dive into growth and performance metrics</p>
      </div>

      <div className="mb-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s-md)' }}>
        {[
          { label: 'TOTAL REVENUE', value: `₹${(totalRevenue/1000).toFixed(1)}K`, change: '+24%', color: 'var(--text)' },
          { label: 'REGISTRATIONS', value: events.reduce((s, e) => s + e.registered, 0).toLocaleString(), change: '+18%', color: 'var(--text)' },
          { label: 'AVERAGE RATING', value: `${events.filter(e => e.rating > 0).reduce((s, e, _, a) => s + e.rating / a.length, 0).toFixed(1)}`, change: '+0.2', color: 'var(--warning)' },
          { label: 'USER BASE', value: allUsers.length, change: '+5', color: 'var(--text)' },
        ].map(s => (
          <div key={s.label} className="card p-md">
            <div className="text-xs font-black uppercase mb-xs" style={{ color: 'var(--text-faint)' }}>{s.label}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-black uppercase mt-xs" style={{ color: 'var(--success)' }}>{s.change} GROWTH</div>
          </div>
        ))}
      </div>

      <div className="grid-2 gap-xl mb-xl">
        <div className="card">
          <div className="p-md" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-xs font-black uppercase">Revenue Trajectory</h3>
          </div>
          <div className="p-lg" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ANALYTICS_DATA.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-faint)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 900 }} 
                  itemStyle={{ color: 'var(--text)' }}
                  formatter={v => `₹${v.toLocaleString()}`} 
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--text)" strokeWidth={3} dot={false} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="p-md" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-xs font-black uppercase">Volume by Category</h3>
          </div>
          <div className="p-lg" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.registrationsByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-faint)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-faint)', fontSize: 10, fontWeight: 700 }} width={70} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 900 }} itemStyle={{ color: 'var(--text)' }} />
                <Bar dataKey="value" name="Volume" radius={[0,2,2,0]}>
                  {ANALYTICS_DATA.registrationsByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-md" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-xs font-black uppercase">Weekly Activity Cycle</h3>
        </div>
        <div className="p-lg" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ANALYTICS_DATA.weeklyRegistrations}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-faint)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 900 }} itemStyle={{ color: 'var(--text)' }} />
              <Bar dataKey="count" name="Activity" radius={[2,2,0,0]}>
                {ANALYTICS_DATA.weeklyRegistrations.map((_, i) => <Cell key={i} fill={i >= 5 ? '#ffffff' : 'rgba(255,255,255,0.05)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}

