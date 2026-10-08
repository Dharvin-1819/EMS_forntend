import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { registerAsync, clearAuthError } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { isAuthenticated, currentUser, authError, registrationPending, loading } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'user' });
  const [showPass, setShowPass] = useState(false);

  // If already logged in, go to dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const redirect = { admin: '/admin/dashboard', organizer: '/organizer/dashboard', user: '/user/dashboard' };
      navigate(redirect[currentUser.role] || '/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // After registration, redirect to pending approval page
  useEffect(() => {
    if (registrationPending) {
      toast.success('Account created! Awaiting admin approval.');
      navigate('/pending-approval');
    }
  }, [registrationPending, navigate]);

  useEffect(() => {
    if (authError) toast.error(authError);
    return () => dispatch(clearAuthError());
  }, [authError, dispatch]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    dispatch(registerAsync(form));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        background: '#EAEAEA',
        padding: '32px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justify: 'center',
        }}
      >
        {/* Brand Badge */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 22px',
              borderRadius: '9999px',
              background: '#231F20',
              border: '1px solid #AD974F',
              textDecoration: 'none',
              marginBottom: 16,
              boxShadow: '0 4px 16px rgba(35, 31, 32, 0.15)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#AD974F' }} />
            <span className="font-black" style={{ fontSize: '0.9rem', color: '#AD974F', letterSpacing: '0.08em' }}>
              EVENTPRO
            </span>
          </Link>
          <h1
            className="font-black uppercase"
            style={{
              fontSize: '2rem',
              color: '#231F20',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            Create Your Account
          </h1>
          <p
            className="text-xs font-bold uppercase"
            style={{ color: '#8E793E', margin: 0, textAlign: 'center', letterSpacing: '0.05em' }}
          >
            Join EventPro to explore, host, and book events
          </p>
        </div>

        {/* Card Container */}
        <div
          style={{
            width: '100%',
            background: '#231F20',
            border: '1px solid rgba(173, 151, 79, 0.35)',
            borderRadius: '20px',
            padding: '36px 32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            boxSizing: 'border-box',
            color: '#ffffff',
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Full Name & Phone Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ textAlign: 'left' }}>
                <label
                  className="text-xs font-black uppercase"
                  style={{ marginBottom: 6, display: 'block', color: '#ffffff', letterSpacing: '0.04em' }}
                >
                  Full Name
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    className="form-input"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={{
                      paddingLeft: 14,
                      width: '100%',
                      background: '#231F20',
                      color: '#ffffff',
                      borderColor: 'rgba(173, 151, 79, 0.4)',
                      borderRadius: '10px',
                      height: '42px',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <label
                  className="text-xs font-black uppercase"
                  style={{ marginBottom: 6, display: 'block', color: '#ffffff', letterSpacing: '0.04em' }}
                >
                  Phone Number
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    className="form-input"
                    placeholder="Mobile number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    style={{
                      paddingLeft: 14,
                      width: '100%',
                      background: '#231F20',
                      color: '#ffffff',
                      borderColor: 'rgba(173, 151, 79, 0.4)',
                      borderRadius: '10px',
                      height: '42px',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
              <label
                className="text-xs font-black uppercase"
                style={{ marginBottom: 6, display: 'block', color: '#ffffff', letterSpacing: '0.04em' }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{
                    paddingLeft: 14,
                    width: '100%',
                    background: '#231F20',
                    color: '#ffffff',
                    borderColor: 'rgba(173, 151, 79, 0.4)',
                    borderRadius: '10px',
                    height: '42px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
              <label
                className="text-xs font-black uppercase"
                style={{ marginBottom: 6, display: 'block', color: '#ffffff', letterSpacing: '0.04em' }}
              >
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{
                    paddingLeft: 14,
                    paddingRight: 60,
                    width: '100%',
                    background: '#231F20',
                    color: '#ffffff',
                    borderColor: 'rgba(142, 121, 62, 0.35)',
                    borderRadius: '10px',
                    height: '42px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  className="text-xs font-black uppercase"
                  style={{
                    position: 'absolute',
                    right: 12,
                    background: 'none',
                    border: 'none',
                    color: '#AD974F',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Account Type Selector */}
            <div style={{ marginBottom: 24, textAlign: 'left' }}>
              <label
                className="text-xs font-black uppercase"
                style={{ marginBottom: 6, display: 'block', color: '#231F20', letterSpacing: '0.04em' }}
              >
                Account Type
              </label>
              <select
                id="reg-role"
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  color: '#231F20',
                  borderColor: 'rgba(142, 121, 62, 0.35)',
                  borderRadius: '10px',
                  height: '42px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="user">Registered User — Attend & Book Events</option>
                <option value="organizer">Event Organizer — Host & Manage Events</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn font-black uppercase"
              id="register-submit-btn"
              disabled={loading}
              style={{
                height: '46px',
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #AD974F 0%, #8E793E 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 4px 14px rgba(173, 151, 79, 0.35)',
              }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE FREE ACCOUNT →'}
            </button>
          </form>

          <div style={{ height: 1, background: '#EAEAEA', margin: '24px 0' }} />

          {/* Already Registered Link */}
          <p className="text-center text-xs font-bold uppercase" style={{ color: '#231F20', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" className="font-black" style={{ color: '#AD974F', textDecoration: 'underline' }}>
              Sign In
            </Link>
          </p>
        </div>

        {/* Return to Home Link */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link
            to="/"
            className="text-xs font-black uppercase"
            style={{ color: '#8E793E', textDecoration: 'none' }}
          >
            ← Return to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
