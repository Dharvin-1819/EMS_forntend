import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { deleteEvent, deleteEventAsync } from '../../features/events/eventsSlice';
import toast from 'react-hot-toast';

export default function OrganizerEventsPage() {
  const { currentUser } = useSelector(s => s.auth);
  const { events } = useSelector(s => s.events);
  const dispatch = useDispatch();

  const myEvents = events.filter(e => {
    const orgId = e.organizerId || e.organizer?.id;
    const isDirectOrg = String(orgId).replace(/\D/g, '') === String(currentUser?.id).replace(/\D/g, '');
    if (isDirectOrg) return true;
    if (currentUser?.role === 'admin') return true;
    return false;
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      dispatch(deleteEventAsync(id));
      toast.success('Event deleted');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Manage Events</h1>
          <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>{myEvents.length} total events</p>
        </div>
        <Link to="/organizer/create-event">
          <button className="btn btn-primary font-black uppercase" id="create-new-event-btn">
            New Event
          </button>
        </Link>
      </div>

      {myEvents.length === 0 ? (
        <div className="p-2xl text-center">
          <div className="text-lg font-black uppercase mb-xs" style={{ color: '#ffffff' }}>No Live Events</div>
          <div className="text-xs font-semibold uppercase mb-xl" style={{ color: 'var(--text-muted, #94a3b8)' }}>Create your first event to get started.</div>
          <Link to="/organizer/create-event">
            <button className="btn btn-primary font-black uppercase">Create Event</button>
          </Link>
        </div>
      ) : (
        <div className="card p-0">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>
                  <th>Event</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Registrations</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map(ev => (
                  <tr key={ev.id} className="text-xs font-semibold uppercase">
                    <td>
                      <Link to={`/events/${ev.id}`} className="font-black" style={{ color: 'var(--text)' }}>{ev.title}</Link>
                    </td>
                    <td><span className="font-black" style={{ color: 'var(--text-faint)' }}>{ev.category}</span></td>
                    <td>{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{ev.location}</td>
                    <td>
                      <div className="font-black">{ev.registered} / {ev.capacity}</div>
                      <div style={{ width: 80, height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, Math.round(ev.registered / ev.capacity * 100))}%`, height: '100%', background: 'var(--primary)' }} />
                      </div>
                    </td>
                    <td className="font-black">₹{ev.price.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${ev.isPast ? 'badge-info' : 'badge-primary'} font-black text-xs`}>
                        {ev.isPast ? 'PAST' : 'LIVE'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-md">
                        <Link to={`/events/${ev.id}`}>
                          <span className="font-black" style={{ color: 'var(--primary)', cursor: 'pointer' }}>VIEW</span>
                        </Link>
                        <span className="font-black" style={{ color: 'var(--danger)', cursor: 'pointer' }}
                          onClick={() => handleDelete(ev.id, ev.title)} id={`delete-ev-${ev.id}`}>
                          DELETE
                        </span>
                      </div>
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

