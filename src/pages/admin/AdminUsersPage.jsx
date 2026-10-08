import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { deleteUser, approveUser, rejectUser, changeUserRole } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const ROLE_BADGE = { admin: 'badge-danger', organizer: 'badge-primary', user: 'badge-success' };

const STATUS_STYLE = {
  approved: { bg: 'rgba(173,151,79,0.15)', color: '#AD974F', border: 'rgba(173,151,79,0.35)', label: 'APPROVED' },
  pending:  { bg: 'rgba(142,121,62,0.15)',  color: '#8E793E', border: 'rgba(142,121,62,0.35)',  label: 'PENDING'  },
  rejected: { bg: 'rgba(35,31,32,0.15)',   color: '#231F20', border: 'rgba(35,31,32,0.35)',   label: 'REJECTED' },
};

export default function AdminUsersPage() {
  const { allUsers, currentUser } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

  const handleDelete = (id, name) => {
    if (id === currentUser.id) { toast.error('Self-deletion blocked'); return; }
    if (window.confirm(`Delete user "${name}"?`)) {
      dispatch(deleteUser(id));
      toast.success('User removed');
    }
  };

  const handleApprove = (id, name) => {
    dispatch(approveUser(id));
    toast.success(`${name} approved — they can now log in`);
  };

  const handleReject = (id, name) => {
    dispatch(rejectUser(id));
    toast.error(`${name}'s access rejected`);
  };

  const handleRoleChange = (id, name, newRole) => {
    dispatch(changeUserRole({ id, role: newRole }));
    toast.success(`${name}'s role changed to ${newRole}`);
  };

  const pendingCount = allUsers.filter(u => u.status === 'pending').length;

  const displayed = filter === 'all'
    ? allUsers
    : allUsers.filter(u => (u.status || 'approved') === filter);

  return (
    <DashboardLayout>
      <div className="mb-xl">
        <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Account Directory</h1>
        <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
          {allUsers.length} total registered accounts
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-md)' }}>
        {[
          { role: 'admin',     label: 'ADMINS',     color: 'var(--text)' },
          { role: 'organizer', label: 'ORGANIZERS', color: 'var(--text)' },
          { role: 'user',      label: 'USERS',      color: 'var(--text)' },
        ].map(r => (
          <div key={r.role} className="card p-md">
            <div className="text-xs font-black uppercase mb-xs" style={{ color: 'var(--text-faint)' }}>{r.label}</div>
            <div className="text-2xl font-black" style={{ color: r.color }}>
              {allUsers.filter(u => u.role === r.role).length}
            </div>
          </div>
        ))}

        {/* Pending approvals highlight card */}
        <div className="card p-md" style={{
          background: pendingCount > 0 ? 'rgba(249,115,22,0.08)' : undefined,
          border: pendingCount > 0 ? '1px solid rgba(249,115,22,0.3)' : undefined,
        }}>
          <div className="text-xs font-black uppercase mb-xs" style={{ color: pendingCount > 0 ? 'var(--primary)' : 'var(--text-faint)' }}>
            PENDING APPROVAL
          </div>
          <div className="text-2xl font-black" style={{ color: pendingCount > 0 ? 'var(--primary)' : 'var(--text)' }}>
            {pendingCount}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-lg" style={{ display: 'flex', gap: 'var(--s-sm)' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            id={`filter-${f}`}
            className="btn btn-sm"
            style={{
              background: filter === f ? 'var(--primary)' : 'var(--surface)',
              color: filter === f ? '#fff' : 'var(--text-muted)',
              border: filter === f ? 'none' : '1px solid var(--border)',
              textTransform: 'uppercase',
              fontWeight: 800,
              letterSpacing: '0.05em',
            }}
            onClick={() => setFilter(f)}
          >
            {f === 'pending' && pendingCount > 0 ? `${f.toUpperCase()} (${pendingCount})` : f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card p-0">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr className="text-xs font-black uppercase">
                <th>Attendee</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-sm font-semibold uppercase" style={{ color: 'var(--text-faint)', padding: 'var(--s-xl)' }}>
                    No users in this category
                  </td>
                </tr>
              )}
              {displayed.map((user) => {
                const status = user.status || 'approved';
                const st = STATUS_STYLE[status] || STATUS_STYLE.approved;
                return (
                  <tr key={user.id} className="text-xs font-semibold uppercase">
                    <td>
                      <div className="flex items-center gap-sm">
                        <div className="flex-center font-black" style={{
                          width: 32, height: 32, borderRadius: 'var(--radius)',
                          background: status === 'pending' ? 'rgba(249,115,22,0.15)' : 'var(--bg-subtle)',
                          border: `1px solid ${status === 'pending' ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`,
                          fontSize: '0.75rem', color: status === 'pending' ? 'var(--primary)' : 'var(--text)',
                        }}>
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="font-black" style={{ color: 'var(--text)' }}>{user.name}</div>
                          {user.id === currentUser.id && (
                            <div className="text-xs font-black" style={{ color: 'var(--primary)' }}>LOGGED IN</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text)' }}>{user.email}</div>
                      <div style={{ color: 'var(--text-faint)' }}>{user.phone || 'NO PHONE'}</div>
                    </td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className={`badge ${ROLE_BADGE[user.role]} font-black text-xs`}>
                          {user.role.toUpperCase()}
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, user.name, e.target.value)}
                          id={`role-select-${user.id}`}
                          style={{
                            background: 'var(--surface)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            padding: '4px 8px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="user">USER</option>
                          <option value="organizer">ORGANIZER</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: st.bg,
                        color: st.color,
                        border: `1px solid ${st.border}`,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                      }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.joinedAt}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {/* Approve button — shown for pending or rejected */}
                        {status !== 'approved' && user.role !== 'admin' && (
                          <button
                            id={`approve-user-${user.id}`}
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(16,185,129,0.12)',
                              color: '#10b981',
                              border: '1px solid rgba(16,185,129,0.3)',
                              fontWeight: 800,
                            }}
                            onClick={() => handleApprove(user.id, user.name)}
                          >
                            APPROVE
                          </button>
                        )}

                        {/* Reject button — shown for pending or approved (non-admin) */}
                        {status !== 'rejected' && user.role !== 'admin' && user.id !== currentUser.id && (
                          <button
                            id={`reject-user-${user.id}`}
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(239,68,68,0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239,68,68,0.25)',
                              fontWeight: 800,
                            }}
                            onClick={() => handleReject(user.id, user.name)}
                          >
                            REJECT
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          className="btn-text font-black"
                          style={{ color: 'var(--danger)', opacity: user.id === currentUser.id ? 0.3 : 1 }}
                          onClick={() => handleDelete(user.id, user.name)}
                          id={`del-user-${user.id}`}
                          disabled={user.id === currentUser.id}
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
