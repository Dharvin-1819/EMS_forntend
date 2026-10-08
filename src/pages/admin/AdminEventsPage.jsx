import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { deleteEvent, deleteEventAsync } from '../../features/events/eventsSlice';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminEventsPage() {
  const { events } = useSelector(s => s.events);
  const dispatch = useDispatch();

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      dispatch(deleteEventAsync(id));
      toast.success('Event removed');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-xl">
        <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Event Audit</h1>
        <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>Monitor and manage all platform events ({events.length} total)</p>
      </div>

      <div className="mb-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-md)' }}>
        {[
          { label: 'ALL EVENTS', value: events.length, color: 'var(--text)' },
          { label: 'ACTIVE', value: events.filter(e => !e.isPast).length, color: 'var(--text)' },
          { label: 'COMPLETED', value: events.filter(e => e.isPast).length, color: 'var(--text-faint)' },
        ].map(s => (
          <div key={s.label} className="card p-md">
            <div className="text-xs font-black uppercase mb-xs" style={{ color: 'var(--text-faint)' }}>{s.label}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card p-0">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr className="text-xs font-black uppercase">
                <th>Event</th>
                <th>Organizer</th>
                <th>Category</th>
                <th>Registrations</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} className="text-xs font-semibold uppercase">
                  <td>
                    <div className="font-black" style={{ color: 'var(--text)' }}>{ev.title}</div>
                    <div style={{ color: 'var(--text-faint)' }}>{new Date(ev.date).toLocaleDateString()}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{ev.organizerName}</td>
                  <td><span className="font-black" style={{ color: 'var(--text-faint)' }}>{ev.category}</span></td>
                  <td>
                    <div className="font-black">{ev.registered} / {ev.capacity}</div>
                    <div style={{ width: 70, height: 4, background: 'var(--border)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, Math.round(ev.registered / ev.capacity * 100))}%`, height: '100%', background: 'var(--primary)' }} />
                    </div>
                  </td>
                  <td className="font-black">₹{ev.price.toLocaleString()}</td>
                  <td className="font-black" style={{ color: 'var(--warning)' }}>{ev.rating || '0.0'}</td>
                  <td>
                    <span className={`badge ${ev.isPast ? 'badge-info' : 'badge-primary'} font-black text-xs`}>
                      {ev.isPast ? 'PAST' : 'ACTIVE'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-md">
                      <Link to={`/events/${ev.id}`}>
                        <span className="font-black" style={{ color: 'var(--primary)', cursor: 'pointer' }}>VIEW</span>
                      </Link>
                      <span className="font-black" style={{ color: 'var(--danger)', cursor: 'pointer' }}
                        onClick={() => handleDelete(ev.id, ev.title)} id={`admin-del-ev-${ev.id}`}>
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
    </DashboardLayout>
  );
}

