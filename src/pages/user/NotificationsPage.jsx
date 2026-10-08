import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { markAsRead, markAllAsRead, deleteNotification } from '../../features/notifications/notificationsSlice';

export default function NotificationsPage() {
  const { currentUser } = useSelector(s => s.auth);
  const { notifications } = useSelector(s => s.notifications);
  const dispatch = useDispatch();

  const isMyNotif = (n) => {
    if (!currentUser) return false;
    if (n.userId === 'all') return true;
    if (String(n.userId) === String(currentUser.id)) return true;
    if (currentUser.email === 'user@eventpro.com' && (n.userId === 'u3' || n.userId === 3)) return true;
    return false;
  };

  const myNotifs = notifications.filter(isMyNotif);
  const unread = myNotifs.filter(n => !n.read);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Notifications</h1>
          <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
            {unread.length} unread · {myNotifs.length} total
          </p>
        </div>
        {unread.length > 0 && (
          <button className="btn btn-secondary btn-sm font-black uppercase" onClick={() => dispatch(markAllAsRead(currentUser.id))} id="mark-all-read-btn">
            Mark All Read
          </button>
        )}
      </div>

      {myNotifs.length === 0 ? (
        <div className="p-2xl text-center">
          <div className="text-lg font-black uppercase mb-xs" style={{ color: '#ffffff' }}>Inbox Clear</div>
          <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted, #94a3b8)' }}>
            We'll notify you about bookings, updates, and offers here.
          </div>
        </div>
      ) : (
        <div className="card p-0">
          <div className="flex flex-col">
            {myNotifs.map((n, i) => {
              const notifType = (n.type || 'info').toUpperCase();
              const dateStr = n.createdAt
                ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : 'Recent';

              return (
                <div
                  key={n.id}
                  className="p-lg flex gap-md"
                  style={{
                    background: !n.read ? 'rgba(173,151,79,0.08)' : 'transparent',
                    borderBottom: i < myNotifs.length - 1 ? '1px solid rgba(173,151,79,0.2)' : 'none'
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-sm items-start">
                      <div className="font-black text-sm uppercase" style={{ color: '#ffffff' }}>
                        <span className="mr-sm" style={{ color: '#AD974F' }}>[{notifType}]</span>
                        {n.title}
                      </div>
                      <div className="text-xs font-black uppercase" style={{ color: '#ffffff', opacity: 0.8 }}>
                        {dateStr}
                      </div>
                    </div>
                    <div className="text-xs font-semibold uppercase mt-xs" style={{ color: '#ffffff', opacity: 0.95, lineHeight: 1.6 }}>
                      {n.message}
                    </div>

                    <div className="flex gap-md mt-md">
                      {!n.read && (
                        <button className="btn-text font-black uppercase text-xs" style={{ color: '#AD974F' }}
                          onClick={() => dispatch(markAsRead(n.id))} id={`read-notif-${n.id}`}>
                          Mark As Read
                        </button>
                      )}
                      <button className="btn-text font-black uppercase text-xs" style={{ color: '#ffffff', opacity: 0.8 }}
                        onClick={() => dispatch(deleteNotification(n.id))} id={`del-notif-${n.id}`}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

