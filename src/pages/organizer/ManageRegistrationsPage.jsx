import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ManageRegistrationsPage() {
  const { currentUser } = useSelector(s => s.auth);
  const { events } = useSelector(s => s.events);
  const { tickets } = useSelector(s => s.tickets);
  const { allUsers } = useSelector(s => s.auth);

  const myEventIds = events.filter(e => {
    const orgId = e.organizerId || e.organizer?.id;
    const isDirectOrg = String(orgId).replace(/\D/g, '') === String(currentUser?.id).replace(/\D/g, '');
    if (isDirectOrg) return true;
    if (currentUser?.role === 'admin') return true;
    return false;
  }).map(e => e.id);
  const myTickets = tickets.filter(t => myEventIds.includes(t.eventId));

  const enriched = myTickets.map(t => {
    const ev = events.find(e => e.id === t.eventId);
    const user = allUsers.find(u => u.id === t.userId);
    return { ...t, eventTitle: ev?.title, userEmail: user?.email };
  });

  return (
    <DashboardLayout>
      <div className="mb-xl">
        <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Registrations</h1>
        <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>{myTickets.length} confirmed attendees across all events</p>
      </div>

      {enriched.length === 0 ? (
        <div className="p-2xl text-center">
          <div className="text-lg font-black uppercase mb-xs" style={{ color: '#ffffff' }}>No Data Available</div>
          <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted, #94a3b8)' }}>Once attendees register for your events, they'll appear here.</div>
        </div>
      ) : (
        <div className="card p-0">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>
                  <th>Ticket #</th>
                  <th>Attendee</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Tier</th>
                  <th>Paid</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map(t => (
                  <tr key={t.id} className="text-xs font-semibold uppercase">
                    <td className="font-mono" style={{ color: 'var(--text-faint)' }}>#{t.ticketNumber}</td>
                    <td>
                      <div className="flex items-center gap-sm">
                        <div className="flex-center font-black" style={{ width: 28, height: 28, borderRadius: 'var(--radius)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                          {t.userName?.[0]}
                        </div>
                        <span className="font-black">{t.userName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.userEmail || '—'}</td>
                    <td className="truncate font-black" style={{ maxWidth: 180, color: 'var(--text)' }}>{t.eventTitle}</td>
                    <td><span className="font-black" style={{ color: 'var(--text-faint)' }}>{t.ticketType}</span></td>
                    <td className="font-black">₹{t.price?.toLocaleString()}</td>
                    <td>{new Date(t.purchasedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${t.status === 'active' ? 'badge-primary' : 'badge-info'} font-black text-xs`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

