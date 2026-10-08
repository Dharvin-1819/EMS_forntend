import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
  const { currentUser } = useSelector(s => s.auth);
  const { tickets } = useSelector(s => s.tickets);

  const isMyTicket = (t) => {
    if (!currentUser) return false;
    if (String(t.userId || t.user?.id) === String(currentUser.id)) return true;
    if (currentUser.email && (t.user?.email === currentUser.email || (currentUser.email === 'user@eventpro.com' && (t.userId === 'u3' || t.userId === 3)))) return true;
    return false;
  };

  const allMyTickets = tickets.filter(isMyTicket);

  return (
    <DashboardLayout>
      <div className="mb-xl">
        <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Registration History</h1>
        <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
          Overview of all your event bookings ({allMyTickets.length} total)
        </p>
      </div>

      {allMyTickets.length === 0 ? (
        <div className="p-2xl text-center">
          <div className="text-lg font-black uppercase mb-xs" style={{ color: '#ffffff' }}>No Records Found</div>
          <div className="text-xs font-semibold uppercase mb-xl" style={{ color: 'var(--text-muted, #94a3b8)' }}>
            Your event registrations will appear here.
          </div>
          <Link to="/events">
            <button className="btn btn-primary font-black uppercase">Find Events</button>
          </Link>
        </div>
      ) : (
        <div className="card p-0">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>
                  <th>Ticket #</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Type</th>
                  <th>Seats</th>
                  <th>Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allMyTickets.map(ticket => {
                  const eventId = ticket.eventId || ticket.event?.id;
                  const eventTitle = ticket.eventTitle || ticket.event?.title || 'Featured Event';
                  const eventDate = ticket.eventDate || ticket.event?.date || ticket.purchasedAt;
                  const venue = ticket.venue || ticket.event?.venue || 'TBA';
                  const ticketTypeName = typeof ticket.ticketType === 'object'
                    ? (ticket.ticketType?.name || 'General')
                    : (ticket.ticketType || 'General');

                  return (
                    <tr key={ticket.id} className="text-xs font-semibold uppercase">
                      <td className="font-mono" style={{ color: 'var(--brand, #AD974F)', fontWeight: 800 }}>
                        #{ticket.ticketNumber || ticket.id}
                      </td>
                      <td>
                        {eventId ? (
                          <Link to={`/events/${eventId}`} className="font-black" style={{ color: '#ffffff' }}>
                            {eventTitle}
                          </Link>
                        ) : (
                          <span className="font-black" style={{ color: '#ffffff' }}>{eventTitle}</span>
                        )}
                      </td>
                      <td style={{ color: '#ffffff' }}>
                        {eventDate ? new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                      </td>
                      <td style={{ color: 'var(--text-muted, #94a3b8)' }}>{venue}</td>
                      <td>
                        <span className="font-black" style={{ color: 'var(--text-faint, #cbd5e1)' }}>
                          {ticketTypeName}
                        </span>
                      </td>
                      <td className="font-black" style={{ color: '#ffffff' }}>
                        {ticket.seats || 1}
                      </td>
                      <td className="font-black" style={{ color: '#ffffff' }}>
                        {ticket.status === 'cancelled' ? (
                          <div>
                            <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.85em', marginRight: 4 }}>
                              ₹{Number(ticket.price || 0).toLocaleString()}
                            </span>
                            <span style={{ color: '#22c55e', display: 'block', fontSize: '0.85rem', fontWeight: 800 }}>
                              ₹0 (Refunded)
                            </span>
                          </div>
                        ) : (
                          `₹${Number(ticket.price || 0).toLocaleString()}`
                        )}
                      </td>
                      <td>
                        {ticket.status === 'cancelled' ? (
                          <div className="flex flex-col gap-xs">
                            <span className="badge badge-danger font-black text-xs uppercase">
                              Cancelled
                            </span>
                            <span className="font-black" style={{ color: '#22c55e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                              Refunded ₹{Number(ticket.refundAmount || ticket.price || 0).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className={`badge ${ticket.status === 'active' ? 'badge-primary' : ticket.status === 'used' ? 'badge-info' : 'badge-danger'} font-black text-xs uppercase`}>
                            {ticket.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


