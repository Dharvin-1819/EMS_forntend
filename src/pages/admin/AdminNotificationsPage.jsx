import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { sendGlobalNotification } from '../../features/notifications/notificationsSlice';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const { notifications } = useSelector(s => s.notifications);
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');

  const handleSend = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { toast.error('Required fields missing'); return; }
    dispatch(sendGlobalNotification({ title, message, type }));
    toast.success('Announcement broadcasted');
    setTitle('');
    setMessage('');
  };

  const globalNotifs = notifications.filter(n => n.userId === 'all');

  return (
    <DashboardLayout>
      <div className="mb-xl">
        <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>System Broadcast</h1>
        <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>Send platform-wide announcements and alerts</p>
      </div>

      <div className="grid-2 gap-xl">
        {/* Send Form */}
        <div className="card">
          <div className="p-md" style={{ borderBottom: '1px solid rgba(173,151,79,0.2)' }}>
            <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Compose Broadcast</h3>
          </div>
          <div className="p-lg">
            <form onSubmit={handleSend} className="flex flex-col gap-md">
              <div className="form-group">
                <label className="text-xs font-black uppercase mb-xs" style={{ color: '#ffffff' }}>Broadcast Title</label>
                <input id="notif-title" className="form-input" placeholder="e.g. Scheduled Downtime"
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="text-xs font-black uppercase mb-xs" style={{ color: '#ffffff' }}>Content Message</label>
                <textarea id="notif-message" className="form-input" rows={4}
                  placeholder="Details of the announcement..."
                  value={message} onChange={e => setMessage(e.target.value)} style={{ resize: 'none' }} />
              </div>
              <div className="form-group">
                <label className="text-xs font-black uppercase mb-xs" style={{ color: '#ffffff' }}>Priority Level</label>
                <select id="notif-type" className="form-select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="info">GENERAL INFORMATION</option>
                  <option value="success">PLATFORM ANNOUNCEMENT</option>
                  <option value="warning">CRITICAL ALERT</option>
                  <option value="promo">PROMOTIONAL OFFER</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary font-black uppercase mt-sm" id="send-notif-btn">
                Broadcast To All
              </button>
            </form>
          </div>
        </div>

        {/* Recent Global Notifications */}
        <div className="card">
          <div className="p-md" style={{ borderBottom: '1px solid rgba(173,151,79,0.2)' }}>
            <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Transmission Log</h3>
          </div>
          <div className="p-lg flex flex-col gap-md">
            {globalNotifs.length === 0 ? (
              <div className="p-xl text-center">
                <div className="text-xs font-black uppercase" style={{ color: '#ffffff', opacity: 0.8 }}>No prior transmissions recorded.</div>
              </div>
            ) : globalNotifs.map(n => (
              <div key={n.id} className="p-md" style={{ background: 'rgba(173,151,79,0.08)', borderRadius: 'var(--radius)', borderLeft: '3px solid #AD974F' }}>
                <div className="flex justify-between items-center mb-xs">
                  <span className="font-black text-xs uppercase" style={{ color: '#ffffff' }}>{n.title}</span>
                  <span className="text-xs font-black uppercase" style={{ color: '#ffffff', opacity: 0.8, fontSize: '0.6rem' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-xs font-semibold uppercase mb-sm" style={{ color: '#ffffff', opacity: 0.95, lineHeight: 1.6 }}>{n.message}</div>
                <div className="flex gap-sm">
                  <span className={`badge ${n.type === 'warning' ? 'badge-danger' : 'badge-primary'} font-black text-xs`}>
                    {n.type.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

