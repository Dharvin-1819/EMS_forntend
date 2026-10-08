import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Modal from '../../components/ui/Modal';
import TicketPass from '../../components/common/TicketPass';
import { addTicket, createTicketAsync } from '../../features/tickets/ticketsSlice';
import { incrementRegistered } from '../../features/events/eventsSlice';
import { addNotification } from '../../features/notifications/notificationsSlice';
import { COUPON_CODES } from '../../data/mockData';
import { getCategoryPalette } from '../../utils/categoryColors';
import toast from 'react-hot-toast';

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

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card' },
  { id: 'upi', label: 'UPI Payment' },
  { id: 'netbanking', label: 'Net Banking' },
  { id: 'wallet', label: 'Digital Wallet' },
];

export default function EventDetailPage() {
  const { id } = useParams();
  const { events } = useSelector(s => s.events);
  const { currentUser, isAuthenticated } = useSelector(s => s.auth);
  const { tickets } = useSelector(s => s.tickets);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [localEvent, setLocalEvent] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const event = events.find(e => String(e.id) === String(id)) || localEvent;

  useEffect(() => {
    if (!event && id) {
      setLoadingDetail(true);
      api.get(`/events/${id}`)
        .then(data => {
          if (data && data.id) setLocalEvent(data);
        })
        .catch(() => {})
        .finally(() => setLoadingDetail(false));
    }
  }, [id, event]);

  const [bookingModal, setBookingModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [seats, setSeats] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [payMethod, setPayMethod] = useState('card');
  const [cardNo, setCardNo] = useState('');
  const [paying, setPaying] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  if (loadingDetail) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#ffffff', fontWeight: 700 }}>Loading event...</div>
    </div>
  );

  if (!event) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, color: '#ffffff' }}>Event not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/events')}>Browse Events</button>
      </div>
    </div>
  );

  const palette = getCategoryPalette(event.category);

  const isBooked = tickets.some(t => String(t.eventId) === String(event.id) && String(t.userId) === String(currentUser?.id) && t.status !== 'cancelled');
  const isSoldOut = event.registered >= event.capacity;
  const pctFull = Math.round((event.registered / event.capacity) * 100);
  const selectedType = event.ticketTypes?.find(t => String(t.id) === String(selectedTicketType));

  const basePrice = selectedType ? selectedType.price * seats : event.price * seats;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.floor(basePrice * appliedCoupon.discount / 100)
      : appliedCoupon.discount
    : 0;
  const total = Math.max(0, basePrice - discount);

  const applyCoupon = () => {
    const code = COUPON_CODES[coupon.toUpperCase()];
    if (code) {
      setAppliedCoupon(code);
      toast.success(`Coupon applied: ${code.description}`);
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleBook = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!event.ticketTypes?.length) {
      setSelectedTicketType(null);
    } else {
      setSelectedTicketType(event.ticketTypes[0].id);
    }
    setBookingModal(true);
  };

  const handleProceedToPay = () => {
    if (!selectedTicketType && event.ticketTypes?.length) {
      toast.error('Please select a ticket type');
      return;
    }
    setBookingModal(false);
    setPayModal(true);
  };

  const handlePayment = async () => {
    if (payMethod === 'card' && cardNo.replace(/\s/g,'').length < 12) {
      toast.error('Please enter a valid card number');
      return;
    }
    setPaying(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate payment
    setPaying(false);
    setPayModal(false);

    try {
      // Issue ticket
      const ticketResult = await dispatch(createTicketAsync({
        eventId: event.id,
        eventTitle: event.title,
        userId: currentUser?.id,
        userName: currentUser?.name,
        ticketType: selectedType?.name || 'General',
        ticketTypeId: selectedType?.id,
        price: total,
        venue: event.venue,
        eventDate: event.date,
        eventCategory: event.category,
        eventTime: event.time,
        seats,
      })).unwrap();

      dispatch(incrementRegistered({ eventId: event.id, seats }));
      dispatch(addNotification({
        userId: currentUser?.id,
        title: 'Booking Confirmed',
        message: `Your booking for "${event.title}" is confirmed. ${seats} ticket(s) issued.`,
        type: 'success',
      }));

      const finalTicket = {
        ...(ticketResult || {}),
        eventTitle: ticketResult?.eventTitle || event.title,
        venue: ticketResult?.venue || event.venue,
        eventDate: ticketResult?.eventDate || event.date,
        eventCategory: ticketResult?.eventCategory || event.category,
        eventTime: ticketResult?.eventTime || event.time,
        ticketType: ticketResult?.ticketType || selectedType?.name || 'General',
        seats: ticketResult?.seats || seats,
        price: ticketResult?.price ?? total,
        userName: ticketResult?.userName || currentUser?.name || 'Valued Guest',
        ticketNumber: ticketResult?.ticketNumber || `EVP-${new Date().getFullYear()}-TK${Date.now() % 10000}`,
        status: ticketResult?.status || 'active',
        purchasedAt: ticketResult?.purchasedAt || new Date().toISOString().split('T')[0],
      };

      setConfirmedTicket(finalTicket);
      setShowTicketModal(true);
      toast.success('Booking confirmed! Here is your ticket.');
    } catch (err) {
      const fallbackTicket = {
        ticketNumber: `EVP-${new Date().getFullYear()}-TK${Date.now() % 10000}`,
        eventTitle: event.title,
        venue: event.venue,
        eventDate: event.date,
        eventCategory: event.category,
        eventTime: event.time,
        ticketType: selectedType?.name || 'General',
        seats,
        price: total,
        userName: currentUser?.name || 'Valued Guest',
        status: 'active',
        purchasedAt: new Date().toISOString().split('T')[0],
      };
      setConfirmedTicket(fallbackTicket);
      setShowTicketModal(true);
      toast.success('Booking confirmed! Here is your ticket.');
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 'var(--navbar-h)' }}>

        {/* Hero Banner */}
        <div style={{ position: 'relative', height: 340, overflow: 'hidden' }}>
          <img
            src={CATEGORY_THUMB[event.category] || '/images/technology.png'}
            alt="Event Background"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 60%, rgba(0,0,0,0.3) 100%)' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'var(--s-xl) var(--s-md)' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span className="badge" style={{ background: palette.badgeBg, color: palette.badgeText, borderColor: palette.border }}>
                {palette.icon} {event.category.toUpperCase()}
              </span>
              {event.isPast && <span className="badge badge-info">Past Event</span>}
              {!event.isPast && isSoldOut && <span className="badge badge-danger">Sold Out</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 900, color: 'white', maxWidth: 800 }}>
              {event.title}
            </h1>
          </div>
        </div>

        <div className="container" style={{ padding: 'var(--s-xl) var(--s-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--s-xl)' }}>

            {/* LEFT */}
            <div>
              {/* Meta */}
              <div className="card mb-lg" style={{ borderColor: palette.border }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {[
                    { label: 'Date', value: `${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${event.endDate !== event.date ? ` – ${new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}` },
                    { label: 'Time', value: event.time },
                    { label: 'Venue', value: event.venue },
                    { label: 'Capacity', value: `${event.registered.toLocaleString()} / ${event.capacity.toLocaleString()}` },
                    { label: 'Chief Guest', value: event.chiefGuest || 'Distinguished Keynote Dignitaries' },
                    { label: 'Food & Refreshments', value: event.foodAvailable || 'Food stalls & beverage points available on-site' },
                  ].map(item => (
                    <div key={item.label} style={{ gridColumn: item.label === 'Chief Guest' || item.label === 'Food & Refreshments' ? 'span 2' : 'span 1' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: item.label === 'Chief Guest' ? palette.primary : 'inherit' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {/* Capacity bar */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Seats filled</span>
                    <span style={{ fontWeight: 700, color: pctFull >= 90 ? 'var(--danger)' : palette.primary }}>{pctFull}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pctFull}%`, background: pctFull >= 90 ? 'var(--danger)' : palette.gradient }} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="card mb-lg" style={{ borderColor: palette.border }}>
                <h3 style={{ marginBottom: 16 }}>About Event</h3>
                <p style={{ lineHeight: 1.8, color: 'var(--text-muted)' }}>{event.description}</p>
                {event.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24 }}>
                    {event.tags.map(tag => (
                      <span key={tag} style={{ padding: '4px 10px', background: palette.bgLight, border: `1px solid ${palette.border}`, borderRadius: 'var(--radius)', fontSize: '0.8rem', color: palette.badgeText, fontWeight: 700 }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Ticket Types */}
              {event.ticketTypes?.length > 0 && (
                <div className="card mb-lg" style={{ borderColor: palette.border }}>
                  <h3 style={{ marginBottom: 16 }}>Ticket Options</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {event.ticketTypes.map(tt => (
                      <div key={tt.id} style={{ display: 'flex', justifyContent: 'space-between', items: 'center', padding: '16px', background: palette.bgLight, borderRadius: 'var(--radius)', border: `1px solid ${palette.border}` }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{tt.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tt.available} units available</div>
                        </div>
                        <div style={{ fontWeight: 800, color: palette.primary, fontSize: '1.25rem' }}>₹{tt.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizer */}
              <div className="card" style={{ borderColor: palette.border }}>
                <h3 style={{ marginBottom: 16 }}>Organizer</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: palette.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', color: 'white', boxShadow: 'none' }}>
                    {event.organizerName?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{event.organizerName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Official Organizer</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: palette.primary, fontWeight: 800 }}>VERIFIED</span>
                </div>
              </div>
            </div>

            {/* RIGHT — Booking Panel */}
            <div style={{ position: 'sticky', top: 'calc(var(--navbar-h) + 24px)', height: 'fit-content' }}>
              <div className="card" style={{ borderColor: palette.border, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Price starts from</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      {event.earlyBirdPrice < event.price && !event.isPast && (
                        <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-faint)' }}>₹{event.price.toLocaleString()}</span>
                      )}
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: palette.primary }}>
                        ₹{(event.earlyBirdPrice || event.price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {event.earlyBirdPrice < event.price && !event.isPast && (
                    <div style={{ background: palette.bgLight, border: `1px solid ${palette.border}`, borderRadius: 'var(--radius)', padding: '12px', fontSize: '0.8rem', color: palette.badgeText, fontWeight: 700 }}>
                      Early Bird: Save ₹{(event.price - event.earlyBirdPrice).toLocaleString()} until {new Date(event.earlyBirdDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  )}

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Rating: <span style={{ fontWeight: 800, color: palette.primary }}>{event.rating}</span> ({event.reviews} reviews)
                  </div>

                  {isBooked ? (
                    <div style={{ textAlign: 'center', padding: '16px', background: palette.bgLight, border: `1px solid ${palette.border}`, borderRadius: 'var(--radius)' }}>
                      <div style={{ color: palette.primary, fontWeight: 700, marginBottom: 12 }}>Booking Confirmed</div>
                      <button className="btn btn-secondary btn-sm w-full" onClick={() => navigate('/user/tickets')}>
                        View Ticket
                      </button>
                    </div>
                  ) : event.isPast ? (
                    <div className="white-box" style={{ textAlign: 'center', padding: '16px', background: '#ffffff', borderRadius: 'var(--radius)', color: '#000000' }}>
                      Event Completed
                    </div>
                  ) : isSoldOut ? (
                    <button className="btn btn-secondary w-full" disabled>Sold Out</button>
                  ) : (
                    <button className="btn btn-primary btn-lg w-full" onClick={handleBook} id="book-now-btn">
                      Book Now
                    </button>
                  )}

                  <div className="white-box" style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: '16px', color: '#000000' }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.85rem', color: '#000000' }}>Coupons</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.75rem', color: '#000000' }}>
                      <span style={{ color: '#000000' }}>• EARLY20 — 20% Off</span>
                      <span style={{ color: '#000000' }}>• SAVE10 — 10% Off</span>
                      <span style={{ color: '#000000' }}>• FLAT500 — ₹500 Off</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Event Concierge / Instant Assistance */}
              <div className="card" style={{ marginTop: 16, borderColor: 'rgba(129, 140, 248, 0.4)', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#e0e7ff', letterSpacing: '0.04em' }}>
                    AI EVENT ASSISTANT
                  </div>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#86efac', borderRadius: '999px', fontWeight: 700 }}>
                    ONLINE
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
                  Have questions about venue, timings, chief guest, or catering? Get instant answers:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Where is the event?',
                    'What time does it start?',
                    'Who is the chief guest?',
                    'Is food available?',
                  ].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-event-ai', { detail: { eventId: event.id, question: q } }))}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(129, 140, 248, 0.3)',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
                        e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.6)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
                        e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.3)';
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm w-full"
                  style={{ marginTop: 14, fontWeight: 700, borderColor: 'rgba(129, 140, 248, 0.5)' }}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-event-ai', { detail: { eventId: event.id } }))}
                >
                  OPEN FULL AI CHAT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Select Tickets"
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button className="btn btn-secondary" onClick={() => setBookingModal(false)}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleProceedToPay} id="proceed-pay-btn">
              Next — ₹{total.toLocaleString()}
            </button>
          </div>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Ticket Type Selection */}
          {event.ticketTypes?.length > 0 && (
            <div className="form-group">
              <label className="form-label">Category</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {event.ticketTypes.map(tt => (
                  <div
                    key={tt.id}
                    onClick={() => setSelectedTicketType(tt.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', padding: '12px 16px',
                      borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                      cursor: 'pointer', background: selectedTicketType === tt.id ? 'var(--primary-muted)' : 'var(--surface)',
                      borderColor: selectedTicketType === tt.id ? 'var(--primary)' : 'var(--border)'
                    }}
                    id={`ticket-type-${tt.id}`}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{tt.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tt.available} left</div>
                    </div>
                    <div style={{ fontWeight: 800 }}>₹{tt.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seats */}
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSeats(Math.max(1, seats - 1))}>–</button>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, width: 30, textAlign: 'center' }}>{seats}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setSeats(Math.min(10, seats + 1))}>+</button>
            </div>
          </div>

          {/* Coupon */}
          <div className="form-group">
            <label className="form-label">Promo Code</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" style={{ flex: 1 }} placeholder="Enter code"
                value={coupon} onChange={e => setCoupon(e.target.value)} id="coupon-input" />
              <button className="btn btn-outline" onClick={applyCoupon} id="apply-coupon-btn">Apply</button>
            </div>
            {appliedCoupon && <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: 8 }}>Applied: {appliedCoupon.description}</div>}
          </div>

          {/* Summary */}
          <div className="white-box" style={{ background: '#ffffff', borderRadius: 'var(--radius)', padding: '16px', fontSize: '0.9rem', color: '#000000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000000', marginBottom: 8 }}>
              <span style={{ color: '#000000' }}>Tickets × {seats}</span>
              <span style={{ color: '#000000' }}>₹{basePrice.toLocaleString()}</span>
            </div>
            {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', marginBottom: 8 }}>
              <span>Discount</span>
              <span>–₹{discount.toLocaleString()}</span>
            </div>}
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#000000' }}>
              <span style={{ color: '#000000' }}>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* PAYMENT MODAL */}
      <Modal isOpen={payModal} onClose={() => setPayModal(false)} title="Payment"
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button className="btn btn-secondary" onClick={() => { setPayModal(false); setBookingModal(true); }}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePayment} disabled={paying} id="confirm-payment-btn">
              {paying ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
            </button>
          </div>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group">
            <label className="form-label">Method</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PAYMENT_METHODS.map(pm => (
                <div key={pm.id} onClick={() => setPayMethod(pm.id)} id={`pay-method-${pm.id}`}
                  style={{
                    padding: '12px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer',
                    background: payMethod === pm.id ? 'var(--primary-muted)' : 'var(--surface)',
                    borderColor: payMethod === pm.id ? 'var(--primary)' : 'var(--border)'
                  }}>
                  <span style={{ fontWeight: 600 }}>{pm.label}</span>
                </div>
              ))}
            </div>
          </div>

          {payMethod === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input className="form-input" id="card-number-input" placeholder="0000 0000 0000 0000"
                  value={cardNo} maxLength={19}
                  onChange={e => setCardNo(e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim())} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input className="form-input" placeholder="MM/YY" maxLength={5} />
                <input className="form-input" placeholder="CVV" maxLength={3} type="password" />
              </div>
            </div>
          )}

          {payMethod === 'upi' && (
            <input className="form-input" id="upi-id-input" placeholder="example@upi" />
          )}

          <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
            Secure checkout powered by EventPro Secure
          </div>
        </div>
      </Modal>

      {/* TICKET CONFIRMATION & PRINT MODAL */}
      <Modal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        size="lg"
        title="Official Event Ticket"
        footer={
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="btn btn-secondary font-black uppercase text-xs"
              onClick={() => {
                setShowTicketModal(false);
                navigate('/user/tickets');
              }}
              id="view-my-tickets-btn"
            >
              Go to My Tickets
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary font-black uppercase text-xs flex items-center gap-xs"
                onClick={() => window.print()}
                id="modal-print-ticket-btn"
              >
                Print Ticket
              </button>
              <button
                className="btn btn-ghost font-black uppercase text-xs"
                onClick={() => setShowTicketModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        }
      >
        <TicketPass
          ticket={confirmedTicket}
          onPrint={() => window.print()}
          onClose={() => setShowTicketModal(false)}
        />
      </Modal>
    </div>
  );
}
