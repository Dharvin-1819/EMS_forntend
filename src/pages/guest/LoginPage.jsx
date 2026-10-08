import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginAsync, clearAuthError } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { isAuthenticated, currentUser, authError, loading } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const redirect = { admin: '/admin/dashboard', organizer: '/organizer/dashboard', user: '/user/dashboard' };
      navigate(redirect[currentUser.role] || '/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  useEffect(() => {
    if (authError) toast.error(authError);
    return () => dispatch(clearAuthError());
  }, [authError, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    dispatch(loginAsync({ email, password }));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#EAEAEA',
        padding: '32px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
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
            Welcome Back
          </h1>
          <p
            className="text-xs font-bold uppercase"
            style={{ color: '#8E793E', margin: 0, textAlign: 'center', letterSpacing: '0.05em' }}
          >
            Sign in to access your account dashboard
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
            {/* Email Field */}
            <div style={{ marginBottom: 20, textAlign: 'left' }}>
              <label
                className="text-xs font-black uppercase"
                style={{ marginBottom: 8, display: 'block', color: '#ffffff', letterSpacing: '0.04em' }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    paddingLeft: 14,
                    width: '100%',
                    background: '#231F20',
                    color: '#ffffff',
                    borderColor: 'rgba(173, 151, 79, 0.4)',
                    borderRadius: '10px',
                    height: '44px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 20, textAlign: 'left' }}>
              <label
                className="text-xs font-black uppercase"
                style={{ marginBottom: 8, display: 'block', color: '#ffffff', letterSpacing: '0.04em' }}
              >
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    paddingLeft: 14,
                    paddingRight: 60,
                    width: '100%',
                    background: '#ffffff',
                    color: '#231F20',
                    borderColor: 'rgba(142, 121, 62, 0.35)',
                    borderRadius: '10px',
                    height: '44px',
                    fontSize: '0.9rem',
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

            {/* Remember Me Option */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#AD974F', width: 16, height: 16 }}
                />
                <span style={{ color: '#ffffff' }}>Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn font-black uppercase"
              id="login-submit-btn"
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
              {loading ? 'AUTHENTICATING...' : 'SIGN IN TO ACCOUNT →'}
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(173, 151, 79, 0.25)', margin: '24px 0' }} />

          {/* Create Account Prompt */}
          <p className="text-center text-xs font-bold uppercase" style={{ color: '#ffffff', margin: 0 }}>
            New to EventPro?{' '}
            <Link to="/register" className="font-black" style={{ color: '#AD974F', textDecoration: 'underline' }}>
              Create an Account
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
