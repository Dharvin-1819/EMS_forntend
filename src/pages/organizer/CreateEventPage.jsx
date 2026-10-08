import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { addEvent, createEventAsync } from '../../features/events/eventsSlice';
import { addNotification } from '../../features/notifications/notificationsSlice';
import { CATEGORIES } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const { currentUser } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', category: 'Technology', date: '', endDate: '', time: '09:00',
    venue: '', location: '', description: '', capacity: 500,
    price: 999, earlyBirdPrice: 699, earlyBirdDeadline: '',
    status: 'upcoming',
  });

  const [ticketTypes, setTicketTypes] = useState([
    { id: 'new_tt1', name: 'General', price: 999, available: 400 },
  ]);

  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title required';
    if (!form.date) errs.date = 'Date required';
    if (!form.venue.trim()) errs.venue = 'Venue required';
    if (!form.location.trim()) errs.location = 'Location required';
    if (!form.description.trim()) errs.description = 'Description required';
    if (form.capacity < 1) errs.capacity = 'Min 1 capacity';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix errors'); return; }

    dispatch(createEventAsync({
      ...form,
      endDate: form.endDate || form.date,
      capacity: Number(form.capacity),
      price: Number(form.price),
      earlyBirdPrice: Number(form.earlyBirdPrice) || Number(form.price),
      organizer: currentUser?.id ? { id: currentUser.id } : null,
      organizerId: currentUser?.id,
      organizerName: currentUser?.name,
      ticketTypes: ticketTypes.map((tt) => ({ name: tt.name, price: Number(tt.price), available: Number(tt.available) })),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      thumbnail: CATEGORIES.find(c => c === form.category)?.toLowerCase() || 'tech',
      rating: 0, reviews: 0,
    }));

    dispatch(addNotification({
      userId: 'all',
      title: `Event Added: ${form.title}`,
      message: `A new ${form.category} event: "${form.title}" on ${new Date(form.date).toLocaleDateString()}.`,
      type: 'info',
    }));

    toast.success('Event published');
    navigate('/organizer/events');
  };

  const addTicketType = () => {
    setTicketTypes(p => [...p, { id: `new_tt${Date.now()}`, name: '', price: 0, available: 100 }]);
  };

  const removeTicketType = (id) => {
    setTicketTypes(p => p.filter(tt => tt.id !== id));
  };

  const updateTicketType = (id, field, value) => {
    setTicketTypes(p => p.map(tt => tt.id === id ? { ...tt, [field]: value } : tt));
  };

  return (
    <DashboardLayout>
      <div className="mb-xl">
        <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Create Event</h1>
        <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>Provide details to launch your next experience</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-xl">

          {/* Basic Info */}
          <div className="card">
            <div className="p-md" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Information</h3>
            </div>
            <div className="p-lg flex flex-col gap-md">
              <div className="form-group">
                <label className="form-label uppercase text-xs">Title</label>
                <input id="event-title" className="form-input"
                  placeholder="e.g. Design Systems Summit 2025"
                  value={form.title} onChange={e => set('title', e.target.value)} />
                {errors.title && <span className="text-xs font-black uppercase" style={{ color: 'var(--danger)' }}>{errors.title}</span>}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label uppercase text-xs">Category</label>
                  <select id="event-category" className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label uppercase text-xs">Status</label>
                  <select id="event-status" className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="upcoming">UPCOMING</option>
                    <option value="ongoing">ONGOING</option>
                    <option value="completed">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label uppercase text-xs">Description</label>
                <textarea id="event-description" className="form-input"
                  placeholder="What is this event about?"
                  value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ resize: 'none' }} />
                {errors.description && <span className="text-xs font-black uppercase" style={{ color: 'var(--danger)' }}>{errors.description}</span>}
              </div>

              <div className="form-group">
                <label className="form-label uppercase text-xs">Tags</label>
                <input id="event-tags" className="form-input" placeholder="DESIGN, PRODUCT, WEB"
                  value={tags} onChange={e => setTags(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Schedule & Venue */}
          <div className="card">
            <div className="p-md" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Venue & Schedule</h3>
            </div>
            <div className="p-lg flex flex-col gap-md">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--s-md)' }}>
                <div className="form-group">
                  <label className="form-label uppercase text-xs">Start Date</label>
                  <input id="event-date" type="date" className="form-input"
                    value={form.date} onChange={e => set('date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label uppercase text-xs">End Date</label>
                  <input id="event-end-date" type="date" className="form-input"
                    value={form.endDate} onChange={e => set('endDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label uppercase text-xs">Time</label>
                  <input id="event-time" type="time" className="form-input"
                    value={form.time} onChange={e => set('time', e.target.value)} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label uppercase text-xs">Venue</label>
                  <input id="event-venue" className="form-input"
                    placeholder="Grand Auditorium"
                    value={form.venue} onChange={e => set('venue', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label uppercase text-xs">City</label>
                  <input id="event-location" className="form-input"
                    placeholder="New Delhi"
                    value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label uppercase text-xs">Capacity</label>
                <input id="event-capacity" type="number" className="form-input"
                  value={form.capacity} onChange={e => set('capacity', e.target.value)} min={1} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <div className="p-md" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Pricing</h3>
            </div>
            <div className="p-lg grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="form-group">
                <label className="form-label uppercase text-xs">Regular Price (₹)</label>
                <input id="event-price" type="number" className="form-input"
                  value={form.price} onChange={e => set('price', e.target.value)} min={0} />
              </div>
              <div className="form-group">
                <label className="form-label uppercase text-xs">Early Bird (₹)</label>
                <input id="event-early-bird-price" type="number" className="form-input"
                  value={form.earlyBirdPrice} onChange={e => set('earlyBirdPrice', e.target.value)} min={0} />
              </div>
              <div className="form-group">
                <label className="form-label uppercase text-xs">Offer Deadline</label>
                <input id="event-early-bird-deadline" type="date" className="form-input"
                  value={form.earlyBirdDeadline} onChange={e => set('earlyBirdDeadline', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Ticket Types */}
          <div className="card">
            <div className="p-md flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Tier Management</h3>
              <button type="button" className="btn btn-secondary btn-sm font-black uppercase" onClick={addTicketType} id="add-ticket-type-btn">
                Add Tier
              </button>
            </div>
            <div className="p-lg flex flex-col gap-md">
              {ticketTypes.map((tt, i) => (
                <div key={tt.id} className="p-md grid-2 white-box" style={{ gridTemplateColumns: '2fr 1fr 1fr auto', alignItems: 'center', background: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid #cccccc' }}>
                  <div className="form-group">
                    <label className="text-xs font-black uppercase mb-xs" style={{ color: '#000000' }}>Name</label>
                    <input className="form-input" placeholder="VIP Pass" style={{ background: '#f8f8f8', color: '#000000', border: '1px solid #cccccc' }}
                      value={tt.name} onChange={e => updateTicketType(tt.id, 'name', e.target.value)} id={`tt-name-${i}`} />
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-black uppercase mb-xs" style={{ color: '#000000' }}>Price</label>
                    <input type="number" className="form-input" style={{ background: '#f8f8f8', color: '#000000', border: '1px solid #cccccc' }}
                      value={tt.price} onChange={e => updateTicketType(tt.id, 'price', e.target.value)} id={`tt-price-${i}`} />
                  </div>
                  <div className="form-group">
                    <label className="text-xs font-black uppercase mb-xs" style={{ color: '#000000' }}>Count</label>
                    <input type="number" className="form-input" style={{ background: '#f8f8f8', color: '#000000', border: '1px solid #cccccc' }}
                      value={tt.available} onChange={e => updateTicketType(tt.id, 'available', e.target.value)} id={`tt-available-${i}`} />
                  </div>
                  <button type="button" className="font-black uppercase text-xs" style={{ color: 'var(--danger)', marginTop: 16 }} onClick={() => removeTicketType(tt.id)} id={`remove-tt-${i}`}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-md justify-end mt-xl">
            <button type="button" className="btn btn-secondary font-black uppercase" onClick={() => navigate('/organizer/events')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg font-black uppercase" id="publish-event-btn" style={{ minWidth: 200 }}>
              Publish Event
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}

