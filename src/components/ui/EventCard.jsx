import { useNavigate } from 'react-router-dom';
import { getCategoryPalette } from '../../utils/categoryColors';

const CATEGORY_THUMB = {
  Technology: '/images/technology.png',
  Music: '/images/music.png',
  Sports: '/images/sports.png',
  Business: '/images/business.png',
  Arts: '/images/arts.png',
  Food: '/images/food.png',
  Health: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
  Education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
};

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const isSoldOut = event.registered >= event.capacity;
  const pctFull = Math.round((event.registered / event.capacity) * 100);
  
  // Auto-choose dynamic color palette based on category/image
  const palette = getCategoryPalette(event.category);

  return (
    <div
      className="card p-0"
      onClick={() => navigate(`/events/${event.id}`)}
      id={`event-card-${event.id}`}
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
      <div className="event-card-thumb" style={{ position: 'relative', height: '160px' }}>
        <img
          src={CATEGORY_THUMB[event.category] || '/images/technology.png'}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span
            className="badge"
            style={{
              background: palette.badgeBg,
              color: palette.badgeText,
              borderColor: palette.border,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {event.category.toUpperCase()}
          </span>
          {event.isPast && <span className="badge badge-info uppercase">FINISHED</span>}
          {!event.isPast && isSoldOut && <span className="badge badge-danger uppercase">SOLD OUT</span>}
        </div>
        {event.rating > 0 && (
          <div className="text-xs font-black uppercase" style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'var(--surface)', padding: '4px 8px',
            borderRadius: 'var(--radius)', color: palette.primary,
            border: `1px solid ${palette.border}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            Rating: {event.rating}
          </div>
        )}
      </div>

      <div className="p-md" style={{ background: '#231F20', color: '#ffffff' }}>
        <div className="event-title text-lg font-black uppercase mb-xs truncate" style={{ color: '#ffffff' }}>{event.title}</div>
        <div className="flex flex-col gap-xs">
          <div className="text-xs font-semibold uppercase" style={{ color: '#ffffff', opacity: 0.9 }}>
            <span className="font-black" style={{ color: '#AD974F' }}>DATE</span> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-xs font-semibold uppercase truncate" style={{ color: '#ffffff', opacity: 0.9 }}>
            <span className="font-black" style={{ color: '#AD974F' }}>LOC</span> {event.location}
          </div>
          <div className="text-xs font-semibold uppercase" style={{ color: '#ffffff', opacity: 0.9 }}>
            <span className="font-black" style={{ color: '#AD974F' }}>REG</span> {event.registered.toLocaleString()} / {event.capacity.toLocaleString()}
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mt-md">
          <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', width: '100%' }}>
            <div
              style={{
                height: '100%',
                width: `${pctFull}%`,
                background: pctFull >= 90 ? 'var(--danger)' : palette.gradient,
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>
          <div className="text-xs font-black uppercase mt-xs" style={{ color: '#ffffff', opacity: 0.85, fontSize: '0.78rem' }}>
            {pctFull}% CAPACITY REACHED
          </div>
        </div>
      </div>

      <div className="p-md flex justify-between items-center" style={{ background: '#231F20', borderTop: `1px solid ${palette.border}` }}>
        <div className="font-black text-lg" style={{ color: '#ffffff' }}>
          {event.price === 0 ? 'FREE' : `₹${(event.earlyBirdPrice || event.price).toLocaleString()}`}
        </div>
        <button
          className="btn btn-sm font-black uppercase"
          style={{
            background: isSoldOut || event.isPast ? 'var(--secondary)' : palette.gradient,
            color: '#ffffff',
            boxShadow: 'none',
            border: 'none'
          }}
          onClick={e => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
        >
          {event.isPast ? 'DETAILS' : isSoldOut ? 'WAITLIST' : 'BOOK NOW'}
        </button>
      </div>
    </div>
  );
}


