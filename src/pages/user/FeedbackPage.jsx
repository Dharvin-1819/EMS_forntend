import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { addFeedback } from '../../features/feedback/feedbackSlice';
import { addReview } from '../../features/events/eventsSlice';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const { currentUser } = useSelector(s => s.auth);
  const { tickets } = useSelector(s => s.tickets);
  const { events } = useSelector(s => s.events);
  const { feedbacks } = useSelector(s => s.feedback);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'cancellations'
  const [modal, setModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const isMyTicket = (t) => {
    if (!currentUser) return false;
    if (String(t.userId || t.user?.id) === String(currentUser.id)) return true;
    if (currentUser.email && (t.user?.email === currentUser.email || (currentUser.email === 'user@eventpro.com' && (t.userId === 'u3' || t.userId === 3)))) return true;
    return false;
  };

  const attendedEventIds = tickets
    .filter(t => isMyTicket(t) && (t.status === 'used' || t.status === 'active'))
    .map(t => String(t.eventId || t.event?.id));
  const uniqueEventIds = [...new Set(attendedEventIds)];
  const attendedEvents = events.filter(e => uniqueEventIds.includes(String(e.id)));
  
  const myReviews = feedbacks.filter(
    f => (String(f.userId) === String(currentUser?.id) || (currentUser?.email === 'user@eventpro.com' && f.userId === 'u3')) && f.type !== 'cancellation'
  );
  const alreadyReviewed = new Set(myReviews.map(f => String(f.eventId)));

  const cancellationFeedbacks = feedbacks.filter(
    f => f.type === 'cancellation' && (String(f.userId) === String(currentUser?.id) || (currentUser?.email === 'user@eventpro.com' && f.userId === 'u3'))
  );

  const handleSubmit = () => {
    if (!comment.trim()) { toast.error('Please write a comment'); return; }
    dispatch(addFeedback({
      eventId: selectedEvent.id,
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment,
      type: 'event_review',
    }));
    dispatch(addReview({ eventId: selectedEvent.id, rating }));
    toast.success('Feedback submitted');
    setModal(false);
    setComment('');
    setRating(5);
  };

  return (
    <DashboardLayout>
      <div className="mb-xl">
        <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>Feedback & Ratings</h1>
        <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
          Share your experience from events and review cancellation insights
        </p>

        {/* Tab Switcher */}
        <div className="flex gap-md mt-lg" style={{ borderBottom: '1px solid rgba(173, 151, 79, 0.2)', paddingBottom: '12px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'reviews' ? 'btn-primary' : 'btn-outline'} font-black uppercase text-xs`}
            onClick={() => setActiveTab('reviews')}
            id="tab-reviews"
          >
            Event Reviews ({attendedEvents.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'cancellations' ? 'btn-primary' : 'btn-outline'} font-black uppercase text-xs`}
            onClick={() => setActiveTab('cancellations')}
            id="tab-cancellations"
          >
            Cancellation Feedback ({cancellationFeedbacks.length})
          </button>
        </div>
      </div>

      {activeTab === 'reviews' && (
        <>
          {attendedEvents.length === 0 ? (
            <div className="p-2xl text-center card" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(173, 151, 79, 0.2)' }}>
              <div className="text-lg font-black uppercase mb-xs" style={{ color: '#ffffff' }}>No Events to Review</div>
              <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                Book and attend events to leave reviews and help the community.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              {attendedEvents.map(ev => {
                const reviewed = alreadyReviewed.has(String(ev.id));
                const myReview = myReviews.find(f => String(f.eventId) === String(ev.id));
                return (
                  <div key={ev.id} className="card p-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-xs font-black uppercase mb-xs" style={{ color: 'var(--brand, #AD974F)' }}>{ev.category}</div>
                        <div className="text-lg font-black uppercase" style={{ color: '#ffffff' }}>{ev.title}</div>
                        <div className="text-xs font-semibold uppercase mt-sm" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                          {new Date(ev.date).toLocaleDateString('en-IN')} · {ev.location}
                        </div>
                        {reviewed && myReview && (
                          <div className="mt-md p-md rounded" style={{ background: '#1c1917', border: '1px solid rgba(173, 151, 79, 0.3)' }}>
                            <div className="text-xs font-black uppercase mb-xs" style={{ color: '#eab308' }}>
                              Score: {myReview.rating} / 5
                            </div>
                            <div className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>
                              "{myReview.comment}"
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ marginLeft: 24 }}>
                        {reviewed ? (
                          <span className="badge badge-success font-black text-xs uppercase">Reviewed</span>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm font-black uppercase"
                            id={`review-btn-${ev.id}`}
                            onClick={() => { setSelectedEvent(ev); setModal(true); }}
                          >
                            Rate Event
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Community Feedback */}
          {feedbacks.filter(f => f.type !== 'cancellation').length > 0 && (
            <div className="card mt-xl p-0">
              <div className="p-md border-b" style={{ borderColor: 'rgba(173, 151, 79, 0.2)' }}>
                <h3 className="text-xs font-black uppercase" style={{ color: '#ffffff' }}>Community Feedback</h3>
              </div>
              <div className="flex flex-col">
                {feedbacks.filter(f => f.type !== 'cancellation').map((fb, i) => (
                  <div key={fb.id} className="p-lg" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div className="flex justify-between items-start mb-md">
                      <div className="flex gap-md items-center">
                        <div className="flex-center font-black" style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'var(--brand, #AD974F)', color: '#000000', fontSize: '0.8rem' }}>
                          {(fb.userName || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-black uppercase" style={{ color: '#ffffff' }}>{fb.userName}</div>
                          <div className="text-xs font-semibold uppercase" style={{ color: 'var(--brand, #AD974F)' }}>
                            {events.find(e => String(e.id) === String(fb.eventId))?.title || 'Event'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-black uppercase" style={{ color: '#eab308' }}>
                        Score: {fb.rating} / 5
                      </div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: '#cbd5e1', lineHeight: 1.5 }}>
                      "{fb.comment}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Cancellation Feedback Tab */}
      {activeTab === 'cancellations' && (
        <div>
          {cancellationFeedbacks.length === 0 ? (
            <div className="p-2xl text-center card" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(173, 151, 79, 0.2)' }}>
              <div className="text-lg font-black uppercase mb-xs" style={{ color: '#ffffff' }}>No Cancellation Feedback Yet</div>
              <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                When you cancel a booking from My Tickets, your cancellation feedback form responses will be tracked and displayed here.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              {cancellationFeedbacks.map(cf => (
                <div key={cf.id} className="card p-lg" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div className="flex justify-between items-start mb-md">
                    <div>
                      <div className="flex items-center gap-xs mb-xs">
                        <span className="badge badge-danger font-black text-xs uppercase">Cancelled Booking</span>
                        {cf.refundAmount > 0 && (
                          <span className="badge font-black text-xs uppercase" style={{ background: '#166534', color: '#ffffff' }}>
                            100% Refunded: ₹{Number(cf.refundAmount).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black uppercase" style={{ color: '#ffffff' }}>{cf.eventTitle}</h3>
                      <div className="text-xs font-mono mt-xs" style={{ color: '#94a3b8' }}>
                        Ticket: #{cf.ticketNumber || cf.ticketId} · Submitted on {new Date(cf.createdAt || Date.now()).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black uppercase" style={{ color: '#eab308' }}>
                        Experience: {cf.rating} / 5
                      </div>
                    </div>
                  </div>

                  <div className="p-md rounded" style={{ background: '#1c1917', border: '1px solid rgba(173, 151, 79, 0.2)' }}>
                    <div className="text-xs font-black uppercase mb-xs" style={{ color: 'var(--brand, #AD974F)' }}>
                      Cancellation Reason:
                    </div>
                    <div className="text-sm font-bold" style={{ color: '#ffffff' }}>
                      {cf.reason}
                    </div>

                    {cf.comment && cf.comment !== 'No additional comments provided.' && (
                      <div className="mt-sm pt-sm border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <div className="text-xs font-black uppercase mb-xs" style={{ color: '#94a3b8' }}>
                          Feedback / Comments:
                        </div>
                        <div className="text-sm font-semibold italic" style={{ color: '#f1f5f9' }}>
                          "{cf.comment}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Rate Your Experience"
        footer={
          <div className="flex gap-md">
            <button className="btn btn-secondary font-black uppercase text-xs" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary font-black uppercase text-xs" onClick={handleSubmit} id="submit-review-btn">Post Review</button>
          </div>
        }
      >
        <div className="flex flex-col gap-xl">
          <div>
            <label className="text-xs font-black uppercase mb-md block" style={{ color: '#ffffff' }}>Select Rating</label>
            <div className="flex gap-sm">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="flex-center font-black"
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 'var(--radius)',
                    border: rating === s ? '2px solid #AD974F' : '1px solid rgba(255, 255, 255, 0.15)',
                    background: rating === s ? '#AD974F' : 'rgba(255, 255, 255, 0.05)',
                    color: rating === s ? '#000000' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '1rem',
                  }}
                  id={`rating-${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="text-xs font-black uppercase mb-sm block" style={{ color: '#ffffff' }}>Tell us more</label>
            <textarea
              className="form-input"
              id="review-comment"
              placeholder="What did you like or dislike about the event?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              style={{ width: '100%', resize: 'none', background: '#1c1917', color: '#ffffff', borderColor: '#AD974F' }}
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
