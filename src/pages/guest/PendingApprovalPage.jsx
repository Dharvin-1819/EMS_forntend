import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearRegistrationPending } from '../../features/auth/authSlice';

export default function PendingApprovalPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registrationPending } = useSelector(s => s.auth);

  useEffect(() => {
    if (!registrationPending) navigate('/');
  }, []);

  const handleBack = () => {
    dispatch(clearRegistrationPending());
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: 'var(--s-xl) var(--s-md)',
    }}>
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {/* Spinning ring */}
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          border: '3px solid rgba(173, 151, 79, 0.2)',
          borderTop: '3px solid #AD974F',
          margin: '0 auto var(--s-xl)',
          animation: 'spin 1.4s linear infinite',
        }} />

        <h1 className="text-3xl font-black uppercase mb-md" style={{ color: '#ffffff' }}>
          Account Submitted
        </h1>
        <p className="text-sm font-semibold uppercase mb-xl" style={{ color: '#ffffff' }}>
          Awaiting Admin Approval
        </p>

        <div className="card mb-xl" style={{ textAlign: 'left' }}>
          <div className="card-body">
            <div style={{
              padding: 'var(--s-md)',
              background: 'rgba(173, 151, 79, 0.1)',
              border: '1px solid rgba(173, 151, 79, 0.3)',
              borderRadius: 'var(--radius)',
              marginBottom: 'var(--s-md)',
            }}>
              <div className="text-sm font-black uppercase mb-xs" style={{ color: 'var(--primary)' }}>
                Access Restricted
              </div>
              <div className="text-sm" style={{ color: '#ffffff' }}>
                Your account has been created and is pending review by an administrator.
                You will be able to log in once your account is approved.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-sm)' }}>
              {[
                { num: '1', label: 'Step 1', desc: 'Account registered successfully',      done: true  },
                { num: '2', label: 'Step 2', desc: 'Admin reviews and approves your account', done: false },
                { num: '3', label: 'Step 3', desc: 'You receive access and can sign in',    done: false },
              ].map((step, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--s-sm)',
                  padding: '10px var(--s-md)',
                  borderRadius: 'var(--radius)',
                  background: step.done ? 'rgba(173, 151, 79, 0.15)' : '#ffffff',
                  border: `1px solid ${step.done ? 'rgba(173, 151, 79, 0.4)' : '#cccccc'}`,
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: step.done ? 'var(--primary)' : '#231F20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.82rem', fontWeight: 900,
                    color: '#ffffff',
                  }}>{step.num}</div>
                  <div>
                    <div className="text-xs font-black uppercase" style={{ color: step.done ? 'var(--primary)' : '#000000' }}>
                      {step.label}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: step.done ? '#ffffff' : '#000000' }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          id="go-to-login-btn"
          className="btn btn-primary w-full btn-lg mb-md"
          onClick={handleBack}
        >
          GO TO LOGIN
        </button>

        <Link
          to="/"
          className="text-xs font-black uppercase"
          style={{ color: '#ffffff' }}
          onClick={() => dispatch(clearRegistrationPending())}
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
