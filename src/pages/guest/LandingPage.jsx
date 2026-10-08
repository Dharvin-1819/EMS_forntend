import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/layout/Navbar';
import EventCard from '../../components/ui/EventCard';
import { getCategoryPalette } from '../../utils/categoryColors';

const CATEGORIES = [
  { name: 'Technology', image: '/images/technology.png', count: 24 },
  { name: 'Music', image: '/images/music.png', count: 31 },
  { name: 'Sports', image: '/images/sports.png', count: 18 },
  { name: 'Business', image: '/images/business.png', count: 22 },
  { name: 'Arts', image: '/images/arts.png', count: 15 },
  { name: 'Food', image: '/images/food.png', count: 19 },
  { name: 'Health', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800', count: 12 },
  { name: 'Education', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800', count: 27 },
];

const FEATURES = [
  { title: 'Lightning Fast Booking', desc: 'Reserve your spot in seconds with our streamlined checkout process.', color: '#AD974F', cardClass: 'card-orange' },
  { title: 'Secure Payments',        desc: 'Multiple payment options — UPI, cards, net banking, and wallets.',         color: '#AD974F', cardClass: 'card-orange' },
  { title: 'Verified Reviews',       desc: 'Real ratings from real attendees to help you pick the best events.',        color: '#AD974F', cardClass: 'card-orange' },
  { title: 'Digital Tickets',        desc: 'Instant digital tickets with QR codes. No printing required.',               color: '#AD974F', cardClass: 'card-orange' },
];

export default function LandingPage() {
  const { isAuthenticated, currentUser } = useSelector(s => s.auth);
  const { events } = useSelector(s => s.events);
  const navigate = useNavigate();

  const featuredEvents = events.filter(e => !e.isPast).slice(0, 6);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 'var(--navbar-h)' }}>

        {/* ===== HERO ===== */}
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-badge font-black uppercase text-xs" style={{ background: 'rgba(173, 151, 79, 0.15)', color: '#AD974F', border: '1px solid rgba(173, 151, 79, 0.35)', padding: '4px 12px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginBottom: 'var(--s-md)' }}>
                India's #1 Event Platform
              </div>
              <h1 className="hero-title font-black uppercase gradient-text-rainbow">
                Discover & Attend Extraordinary Events
              </h1>
              <p className="hero-subtitle text-lg font-medium">
                From tech summits to music festivals — find, book, and experience the events that matter to you. Seamless registration and secure payments.
              </p>
              <div className="hero-actions flex gap-md justify-center">
                <Link to="/events">
                  <button className="btn btn-primary btn-lg font-black uppercase" id="hero-browse-btn"
                    style={{ background: 'var(--grad-primary)', boxShadow: 'none' }}>
                    Explore Events
                  </button>
                </Link>
                {!isAuthenticated ? (
                  <Link to="/register">
                    <button className="btn btn-secondary btn-lg font-black uppercase" id="hero-register-btn">
                      Get Started
                    </button>
                  </Link>
                ) : (
                  <Link to={`/${currentUser.role}/dashboard`}>
                    <button className="btn btn-outline btn-lg font-black uppercase">
                      Go to Dashboard
                    </button>
                  </Link>
                )}
              </div>
              <div className="hero-stats flex gap-lg justify-center mt-xl">
                {[
                  { value: '500+',  label: 'EVENTS',     color: '#AD974F' },
                  { value: '1.2L+', label: 'ATTENDEES',  color: '#AD974F' },
                  { value: '200+',  label: 'ORGANIZERS', color: '#AD974F' },
                  { value: '50+',   label: 'CITIES',     color: '#AD974F' },
                ].map(stat => (
                  <div key={stat.label} className="hero-stat flex flex-col items-center">
                    <span className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</span>
                    <span className="text-xs font-black uppercase" style={{ color: 'var(--text-faint)' }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        <section className="section p-lg" style={{ background: 'var(--bg-subtle)' }}>
          <div className="container">
            <div className="flex justify-between items-center mb-xl">
              <div>
                <h2 className="text-2xl font-black uppercase">Browse by Category</h2>
                <p className="text-sm font-semibold uppercase" style={{ color: 'var(--text-faint)' }}>Auto-matched category color themes</p>
              </div>
              <Link to="/events">
                <button className="btn btn-outline btn-sm font-black uppercase">View All</button>
              </Link>
            </div>
            <div className="grid-events">
              {CATEGORIES.map(cat => {
                const palette = getCategoryPalette(cat.name);
                return (
                  <div
                    key={cat.name}
                    className="card p-0"
                    onClick={() => navigate(`/events?category=${cat.name}`)}
                    id={`cat-${cat.name.toLowerCase()}`}
                    style={{
                      cursor: 'pointer',
                      overflow: 'hidden',
                      borderColor: palette.border,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = palette.primary;
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                      e.currentTarget.style.borderColor = palette.border;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ position: 'relative', height: '140px' }}>
                      <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div
                        style={{
                          position: 'absolute',
                          top: 8, right: 8,
                          background: palette.badgeBg,
                          color: palette.badgeText,
                          border: `1px solid ${palette.border}`,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.68rem',
                          fontWeight: 800
                        }}
                      >
                        {palette.tag}
                      </div>
                    </div>
                    <div className="p-sm flex justify-between items-center" style={{ background: '#231F20' }}>
                      <div>
                        <div className="font-extrabold text-lg uppercase category-card-title" style={{ color: '#ffffff' }}>{cat.name}</div>
                        <div className="text-xs font-black uppercase mt-xs" style={{ color: '#ffffff', opacity: 0.9 }}>{cat.count} events</div>
                      </div>
                      <span className="font-black text-xs uppercase" style={{ color: '#AD974F' }}>EXPLORE</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== FEATURED EVENTS ===== */}
        <section className="section p-lg">
          <div className="container">
            <div className="flex justify-between items-center mb-xl">
              <div>
                <h2 className="text-2xl font-black uppercase">Featured Events</h2>
                <p className="text-sm font-semibold uppercase" style={{ color: 'var(--text-faint)' }}>Handpicked experiences you don't want to miss</p>
              </div>
              <Link to="/events">
                <button className="btn btn-outline btn-sm font-black uppercase">See All</button>
              </Link>
            </div>
            <div className="grid-events">
              {featuredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== WHY EVENTPRO ===== */}
        <section className="section p-lg">
          <div className="container">
            <div className="text-center mb-xl">
              <h2 className="text-2xl font-black uppercase" style={{ color: '#ffffff' }}>Why Choose EventPro?</h2>
              <p className="text-sm font-semibold uppercase mt-xs" style={{ color: '#ffffff' }}>Everything you need for a seamless event experience</p>
            </div>
            <div className="grid-events">
              {FEATURES.map(f => (
                <div key={f.title} className={`card ${f.cardClass} p-lg text-center`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-md)', background: '#231F20', border: '1px solid #8E793E' }}>
                  <h3 className="font-bold uppercase text-lg" style={{ color: '#AD974F' }}>{f.title}</h3>
                  <p className="text-sm font-medium" style={{ color: '#ffffff', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        {!isAuthenticated && (
          <section className="section p-lg">
            <div className="container">
              <div className="card text-center p-xl" style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(168,85,247,0.08) 100%)',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 'var(--radius-xl)',
              }}>
                <h2 className="text-3xl font-black uppercase mb-md gradient-text-rainbow">
                  Ready to Get Started?
                </h2>
                <p className="text-sm font-semibold uppercase mb-xl" style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 32px' }}>
                  Join 1.2 lakh+ attendees who use EventPro to discover and book amazing events every day.
                </p>
                <div className="flex gap-md justify-center">
                  <Link to="/register">
                    <button className="btn btn-primary btn-lg font-black uppercase" id="cta-register-btn"
                      style={{ background: 'var(--grad-primary)', boxShadow: 'none' }}>
                      Create Free Account
                    </button>
                  </Link>
                  <Link to="/events">
                    <button className="btn btn-lg font-black uppercase"
                      style={{ background: 'var(--grad-secondary)', color: '#fff', boxShadow: 'none' }}>
                      Browse Events
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== FOOTER ===== */}
        <footer className="p-xl white-box" style={{
          background: '#ffffff',
          borderTop: '1px solid #cccccc',
          color: '#000000',
          fontSize: '0.875rem',
        }}>
          <div className="container">
            <div className="flex justify-between items-center gap-md">
              <div className="font-black text-xl uppercase" style={{ color: '#000000', letterSpacing: '0.05em' }}>
                EventPro
              </div>
              <div className="text-xs font-bold uppercase" style={{ color: '#000000' }}>© 2025 EventPro. All rights reserved.</div>
              <div className="flex gap-md uppercase font-black text-xs">
                <Link to="/events" style={{ color: '#000000' }}>Events</Link>
                <Link to="/login" style={{ color: '#000000' }}>Login</Link>
                <Link to="/register" style={{ color: '#000000' }}>Register</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

