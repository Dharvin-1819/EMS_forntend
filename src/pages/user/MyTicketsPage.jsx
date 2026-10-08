import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import TicketPass from '../../components/common/TicketPass';
import { cancelTicketAsync } from '../../features/tickets/ticketsSlice';
import { addNotification } from '../../features/notifications/notificationsSlice';
import { addCancellationFeedback } from '../../features/feedback/feedbackSlice';
import toast from 'react-hot-toast';

const CANCELLATION_REASONS = [
  { id: 'Schedule Conflict / Date Clash', label: 'Schedule Conflict / Date Clash' },
  { id: 'Personal Emergency or Health Issue', label: 'Personal Emergency or Health Issue' },
  { id: 'Accidental or Duplicate Booking', label: 'Accidental or Duplicate Booking' },
  { id: 'Financial or Found Better Alternative', label: 'Financial or Found Better Alternative' },
  { id: 'Venue Distance / Travel Inconvenience', label: 'Venue Distance / Travel Inconvenience' },
  { id: 'Other Reasons', label: 'Other Reasons' },
];

export default function MyTicketsPage() {
  const { currentUser } = useSelector(s => s.auth);
  const { tickets } = useSelector(s => s.tickets);
  const { feedbacks } = useSelector(s => s.feedback);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'cancelled'
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState(null);
  const [ticketToCancel, setTicketToCancel] = useState(null);
  const [refundReceiptTicket, setRefundReceiptTicket] = useState(null);
  const [postCancelFeedbackTicket, setPostCancelFeedbackTicket] = useState(null);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);

  // Cancellation feedback form state
  const [cancelReason, setCancelReason] = useState(CANCELLATION_REASONS[0].id);
  const [cancelComment, setCancelComment] = useState('');
  const [cancelRating, setCancelRating] = useState(5);
  const [cancelFutureInterest, setCancelFutureInterest] = useState('yes');

  const isMyTicket = (t) => {
    if (!currentUser) return false;
    if (String(t.userId || t.user?.id) === String(currentUser.id)) return true;
    if (currentUser.email && (t.user?.email === currentUser.email || (currentUser.email === 'user@eventpro.com' && (t.userId === 'u3' || t.userId === 3)))) return true;
    return false;
  };

  const userTickets = tickets.filter(isMyTicket);
  const activeTickets = userTickets.filter(t => t.status !== 'cancelled');
  const cancelledTickets = userTickets.filter(t => t.status === 'cancelled');

  const handleOpenCancelModal = (ticket) => {
    setTicketToCancel(ticket);
    setCancelReason(CANCELLATION_REASONS[0].id);
    setCancelComment('');
    setCancelRating(5);
    setCancelFutureInterest('yes');
  };

  const handleConfirmCancellation = async () => {
    if (!ticketToCancel) return;
    setIsProcessingCancel(true);

    const price = Number(ticketToCancel.price || 0);
    const eventTitle = ticketToCancel.eventTitle || ticketToCancel.event?.title || 'Featured Event';
    const refundTxnId = `REF-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // 1. Submit cancellation feedback to Redux & LocalStorage
    dispatch(addCancellationFeedback({
      ticketId: ticketToCancel.id,
      ticketNumber: ticketToCancel.ticketNumber || `EVP-TK${ticketToCancel.id}`,
      eventId: ticketToCancel.eventId || ticketToCancel.event?.id,
      eventTitle,
      userId: currentUser?.id,
      userName: currentUser?.name || 'Valued User',
      reason: cancelReason,
      comment: cancelComment.trim() || 'No additional comments provided.',
      rating: cancelRating,
      futureInterest: cancelFutureInterest,
      refundAmount: price,
      createdAt: new Date().toISOString(),
    }));

    // 2. Dispatch cancellation and refund
    try {
      await dispatch(cancelTicketAsync({
        ticketId: ticketToCancel.id,
        refundAmount: price,
        eventId: ticketToCancel.eventId || ticketToCancel.event?.id,
        seats: ticketToCancel.seats || 1,
        refundMethod: 'Original Payment Method (UPI / Bank)',
      })).unwrap();
    } catch (_) {
      // Fallback handled inside slice
    }

    // 3. Dispatch refund notification
    dispatch(addNotification({
      userId: currentUser?.id,
      title: `₹${price.toLocaleString()} Refund Credited`,
      message: `Your booking for "${eventTitle}" has been cancelled. A 100% refund of ₹${price.toLocaleString()} has been processed and credited to your original payment method. (Ref: ${refundTxnId})`,
      type: 'success',
    }));

    toast.success(`Booking cancelled & feedback saved! ₹${price.toLocaleString()} refunded.`);

    const completedRefundTicket = {
      ...ticketToCancel,
      status: 'cancelled',
      refundStatus: 'Refunded',
      refundAmount: price,
      refundedAt: new Date().toISOString(),
      refundMethod: 'Original Payment Method (UPI / Bank)',
      refundTxnId,
      cancellationFeedback: {
        reason: cancelReason,
        comment: cancelComment,
        rating: cancelRating,
      },
    };

    setIsProcessingCancel(false);
    setTicketToCancel(null);
    setRefundReceiptTicket(completedRefundTicket);
  };

  // Submit feedback for already cancelled ticket if requested
  const handleSavePostCancelFeedback = () => {
    if (!postCancelFeedbackTicket) return;
    const price = Number(postCancelFeedbackTicket.price || 0);
    const eventTitle = postCancelFeedbackTicket.eventTitle || postCancelFeedbackTicket.event?.title || 'Featured Event';

    dispatch(addCancellationFeedback({
      ticketId: postCancelFeedbackTicket.id,
      ticketNumber: postCancelFeedbackTicket.ticketNumber || `EVP-TK${postCancelFeedbackTicket.id}`,
      eventId: postCancelFeedbackTicket.eventId || postCancelFeedbackTicket.event?.id,
      eventTitle,
      userId: currentUser?.id,
      userName: currentUser?.name || 'Valued User',
      reason: cancelReason,
      comment: cancelComment.trim() || 'No additional comments provided.',
      rating: cancelRating,
      futureInterest: cancelFutureInterest,
      refundAmount: price,
      createdAt: new Date().toISOString(),
    }));

    toast.success('Cancellation feedback saved successfully!');
    setPostCancelFeedbackTicket(null);
  };

  const handleOpenPrintModal = (ticket) => {
    const enrichedTicket = {
      ...ticket,
      eventTitle: ticket.eventTitle || ticket.event?.title || 'Featured Event',
      venue: ticket.venue || ticket.event?.venue || 'Venue Hall',
      eventDate: ticket.eventDate || ticket.event?.date,
      eventCategory: ticket.eventCategory || ticket.event?.category,
      eventTime: ticket.eventTime || ticket.event?.time || '10:00 AM',
      ticketType: typeof ticket.ticketType === 'object' ? (ticket.ticketType?.name || 'General') : (ticket.ticketType || 'General'),
      userName: ticket.userName || ticket.user?.name || currentUser?.name || 'Valued Guest',
      seats: ticket.seats || 1,
      price: ticket.price || 0,
      ticketNumber: ticket.ticketNumber || `EVP-TK${ticket.id}`,
    };
    setSelectedTicketForPrint(enrichedTicket);
  };

  const currentDisplayList = activeTab === 'active' ? activeTickets : cancelledTickets;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-xl">
        <h1 className="text-3xl font-black uppercase" style={{ color: '#ffffff' }}>My Tickets & Bookings</h1>
        <p className="text-sm font-semibold uppercase mt-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
          Manage your passes, cancellations, feedback & refunds
        </p>

        {/* Tab Switcher */}
        <div className="flex gap-md mt-lg" style={{ borderBottom: '1px solid rgba(173, 151, 79, 0.2)', paddingBottom: '12px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'active' ? 'btn-primary' : 'btn-outline'} font-black uppercase text-xs`}
            onClick={() => setActiveTab('active')}
            id="tab-active-tickets"
          >
            Active Tickets ({activeTickets.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'cancelled' ? 'btn-primary' : 'btn-outline'} font-black uppercase text-xs`}
            onClick={() => setActiveTab('cancelled')}
            id="tab-cancelled-tickets"
          >
            Refunded &amp; Cancelled ({cancelledTickets.length})
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {currentDisplayList.length === 0 ? (
        <div className="p-2xl text-center card" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(173, 151, 79, 0.2)' }}>
          <div className="text-lg font-black uppercase mb-xs" style={{ color: '#ffffff' }}>
            {activeTab === 'active' ? 'No Active Tickets' : 'No Cancelled Bookings'}
          </div>
          <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted, #94a3b8)' }}>
            {activeTab === 'active'
              ? 'Browse upcoming events and book your passes today!'
              : 'You do not have any cancelled bookings or pending refunds.'}
          </div>
        </div>
      ) : (
        <div className="grid-2 gap-lg">
          {currentDisplayList.map(ticket => {
            const displayTitle = ticket.eventTitle || ticket.event?.title || 'Featured Event';
            const displayDate = ticket.eventDate || ticket.event?.date;
            const displayVenue = ticket.venue || ticket.event?.venue || 'TBA';
            const displayType = ticket.ticketType || (typeof ticket.ticketType === 'object' ? ticket.ticketType?.name : null) || 'General';
            const isCancelled = ticket.status === 'cancelled';
            const refundAmount = ticket.refundAmount !== undefined ? ticket.refundAmount : ticket.price;
            
            // Check if cancellation feedback exists
            const existingFeedback = feedbacks.find(
              f => f.type === 'cancellation' && (String(f.ticketId) === String(ticket.id) || (f.ticketNumber && f.ticketNumber === ticket.ticketNumber))
            );

            return (
              <div key={ticket.id} className="card p-0" style={{ border: isCancelled ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(173, 151, 79, 0.3)' }}>
                {/* Card Top Banner */}
                <div className="p-lg white-box" style={{ borderBottom: '1px solid var(--border)', background: '#ffffff', color: '#000000' }}>
                  <div className="flex justify-between items-center mb-xs">
                    <div className="text-xs font-black uppercase" style={{ color: '#444444' }}>
                      Ticket #{ticket.ticketNumber || ticket.id}
                    </div>
                    {isCancelled && (
                      <span className="badge badge-danger font-black text-xs uppercase">
                        Cancelled
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black uppercase" style={{ color: '#000000' }}>{displayTitle}</h3>
                  <div className="flex gap-sm mt-md">
                    <span className="p-xs px-md font-black text-xs" style={{ background: '#231F20', color: '#ffffff', border: '1px solid #8E793E', borderRadius: 'var(--radius)' }}>
                      {String(displayType).toUpperCase()}
                    </span>
                    <span className="p-xs px-md font-black text-xs" style={{ background: '#231F20', color: '#ffffff', border: '1px solid #8E793E', borderRadius: 'var(--radius)' }}>
                      {ticket.seats || 1} SEAT(S)
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-md">
                      <div>
                        <div className="text-xs font-black uppercase mb-xs" style={{ color: '#ffffff', opacity: 0.8 }}>Date</div>
                        <div className="text-sm font-black uppercase" style={{ color: '#ffffff' }}>
                          {displayDate ? new Date(displayDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase mb-xs" style={{ color: '#ffffff', opacity: 0.8 }}>Venue</div>
                        <div className="text-sm font-semibold uppercase" style={{ color: '#ffffff' }}>{displayVenue}</div>
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase mb-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
                          {isCancelled ? 'Refunded Amount' : 'Paid Amount'}
                        </div>
                        <div className="text-lg font-black uppercase" style={{ color: isCancelled ? '#22c55e' : '#ffffff' }}>
                          ₹{Number(isCancelled ? refundAmount : ticket.price || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex-center font-black white-box" style={{ width: 80, height: 80, background: isCancelled ? '#fee2e2' : '#ffffff', color: isCancelled ? '#ef4444' : '#000000', borderRadius: 'var(--radius)', fontSize: isCancelled ? '0.9rem' : '1.25rem', border: '2px solid #231F20', textAlign: 'center' }}>
                        {isCancelled ? 'VOID' : 'QR'}
                      </div>
                      <span className="text-xs font-black uppercase mt-xs block" style={{ color: isCancelled ? '#ef4444' : '#ffffff' }}>
                        {isCancelled ? 'Cancelled' : 'Verified'}
                      </span>
                    </div>
                  </div>

                  {/* Refund Information Banner if Cancelled */}
                  {isCancelled && (
                    <div className="mt-md p-md rounded" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-xs text-xs font-black uppercase" style={{ color: '#22c55e' }}>
                          100% Refund Credited
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: '#ffffff' }}>
                          {ticket.refundTxnId || `REF-${ticket.id}`}
                        </span>
                      </div>

                      {/* Display Cancellation Feedback if submitted */}
                      {existingFeedback ? (
                        <div className="mt-sm pt-sm border-t" style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                          <div className="text-xs font-black uppercase" style={{ color: 'var(--brand, #AD974F)' }}>
                            Cancellation Feedback:
                          </div>
                          <div className="text-xs font-semibold mt-xs" style={{ color: '#f1f5f9' }}>
                            <span style={{ color: '#94a3b8' }}>Reason:</span> {existingFeedback.reason}
                          </div>
                          {existingFeedback.comment && existingFeedback.comment !== 'No additional comments provided.' && (
                            <div className="text-xs mt-xs italic" style={{ color: '#cbd5e1' }}>
                              "{existingFeedback.comment}"
                            </div>
                          )}
                          <div className="text-xs mt-xs" style={{ color: '#eab308' }}>
                            Experience Rating: {existingFeedback.rating || 5} / 5
                          </div>
                        </div>
                      ) : (
                        <div className="mt-xs flex justify-between items-center">
                          <span className="text-xs" style={{ color: '#94a3b8' }}>No cancellation feedback recorded</span>
                          <button
                            className="btn-text text-xs font-black uppercase"
                            style={{ color: 'var(--brand, #AD974F)', padding: 0 }}
                            onClick={() => {
                              setPostCancelFeedbackTicket(ticket);
                              setCancelReason(CANCELLATION_REASONS[0].id);
                              setCancelComment('');
                              setCancelRating(5);
                            }}
                          >
                            Give Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="mt-xl pt-lg border-t flex justify-between items-center" style={{ borderColor: 'rgba(173, 151, 79, 0.3)' }}>
                    <div className="flex items-center gap-sm">
                      <span className={`badge ${!isCancelled ? 'badge-primary' : 'badge-danger'} font-black text-xs uppercase`}>
                        {ticket.status}
                      </span>
                      {isCancelled && (
                        <span className="badge font-black text-xs uppercase" style={{ background: '#166534', color: '#ffffff' }}>
                          Refund: ₹{Number(refundAmount || 0).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-sm">
                      {!isCancelled ? (
                        <>
                          <button
                            className="btn btn-sm btn-primary font-black uppercase text-xs flex items-center"
                            onClick={() => handleOpenPrintModal(ticket)}
                            id={`print-ticket-${ticket.id}`}
                          >
                            Print Ticket
                          </button>
                          <button
                            className="btn btn-sm btn-outline font-black uppercase text-xs flex items-center"
                            style={{ borderColor: 'var(--danger, #ef4444)', color: 'var(--danger, #ef4444)' }}
                            onClick={() => handleOpenCancelModal(ticket)}
                            id={`cancel-ticket-${ticket.id}`}
                          >
                            Cancel &amp; Refund
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline font-black uppercase text-xs flex items-center"
                          style={{ borderColor: '#22c55e', color: '#22c55e' }}
                          onClick={() => setRefundReceiptTicket(ticket)}
                          id={`view-receipt-${ticket.id}`}
                        >
                          View Refund Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation & Feedback Form Modal */}
      <Modal
        isOpen={Boolean(ticketToCancel)}
        onClose={() => !isProcessingCancel && setTicketToCancel(null)}
        size="lg"
        title="Event Cancellation & Feedback Form"
        footer={
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              className="btn btn-secondary font-black uppercase text-xs"
              onClick={() => setTicketToCancel(null)}
              disabled={isProcessingCancel}
            >
              Keep My Ticket
            </button>
            <button
              className="btn btn-primary font-black uppercase text-xs flex items-center gap-xs"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderColor: '#ef4444', color: '#ffffff' }}
              onClick={handleConfirmCancellation}
              disabled={isProcessingCancel}
              id="confirm-cancel-feedback-btn"
            >
              {isProcessingCancel ? 'Processing...' : `Submit Feedback, Cancel Event & Refund ₹${Number(ticketToCancel?.price || 0).toLocaleString()}`}
            </button>
          </div>
        }
      >
        {ticketToCancel && (
          <div className="flex flex-col gap-lg" style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' }}>
            {/* Refund & Event Summary Callout */}
            <div className="p-md rounded" style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div className="flex justify-between items-center mb-xs">
                <span className="text-xs font-black uppercase" style={{ color: '#22c55e' }}>
                  100% Full Refund Guarantee
                </span>
                <span className="text-sm font-black" style={{ color: '#22c55e' }}>
                  ₹{Number(ticketToCancel.price || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-xs font-semibold" style={{ color: '#cbd5e1' }}>
                Your ticket for <strong style={{ color: '#ffffff' }}>{ticketToCancel.eventTitle || ticketToCancel.event?.title}</strong> will be cancelled and the full amount will be credited back immediately. Please help us and the organizers improve by sharing your cancellation feedback.
              </p>
            </div>

            {/* Question 1: Cancellation Reason */}
            <div>
              <label className="text-xs font-black uppercase mb-sm block" style={{ color: '#ffffff' }}>
                1. What is the primary reason for cancelling? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="grid-2 gap-sm">
                {CANCELLATION_REASONS.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setCancelReason(r.id)}
                    className="p-sm rounded flex items-center gap-sm cursor-pointer"
                    style={{
                      background: cancelReason === r.id ? 'rgba(173, 151, 79, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: cancelReason === r.id ? '1px solid #AD974F' : '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.15s ease',
                    }}
                    id={`reason-opt-${r.id.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <input
                      type="radio"
                      name="cancelReasonRadio"
                      checked={cancelReason === r.id}
                      onChange={() => setCancelReason(r.id)}
                      style={{ accentColor: '#AD974F' }}
                    />
                    <span className="text-xs font-semibold" style={{ color: cancelReason === r.id ? '#ffffff' : '#94a3b8' }}>
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 2: Detailed Suggestions / Comments */}
            <div>
              <label className="text-xs font-black uppercase mb-xs block" style={{ color: '#ffffff' }}>
                2. Suggestions or additional details for the organizer (Optional)
              </label>
              <p className="text-xs mb-xs" style={{ color: '#94a3b8' }}>
                What could have made you keep your booking, or how could the event be improved?
              </p>
              <textarea
                className="form-input"
                id="cancel-feedback-comment"
                placeholder="Share your thoughts or any specific issue you faced..."
                value={cancelComment}
                onChange={e => setCancelComment(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  borderColor: 'rgba(173, 151, 79, 0.3)',
                  color: '#ffffff',
                  resize: 'none',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Question 3: Rating for Booking Experience */}
            <div>
              <label className="text-xs font-black uppercase mb-xs block" style={{ color: '#ffffff' }}>
                3. How would you rate your overall booking experience with EventPro?
              </label>
              <div className="flex gap-sm">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCancelRating(star)}
                    className="flex-center font-black p-sm rounded"
                    style={{
                      flex: 1,
                      height: 40,
                      background: cancelRating >= star ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: cancelRating >= star ? '1px solid #eab308' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: cancelRating >= star ? '#eab308' : '#64748b',
                      fontSize: '1rem',
                      cursor: 'pointer',
                    }}
                    id={`cancel-rating-${star}`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4: Future Attendance Interest */}
            <div>
              <label className="text-xs font-black uppercase mb-xs block" style={{ color: '#ffffff' }}>
                4. Would you consider booking this or another event in the future?
              </label>
              <div className="flex gap-md">
                {[
                  { value: 'yes', label: 'Yes, definitely' },
                  { value: 'maybe', label: 'Maybe in the future' },
                  { value: 'no', label: 'No' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-xs cursor-pointer text-xs font-semibold"
                    style={{ color: cancelFutureInterest === opt.value ? '#ffffff' : '#94a3b8' }}
                  >
                    <input
                      type="radio"
                      name="futureInterestRadio"
                      value={opt.value}
                      checked={cancelFutureInterest === opt.value}
                      onChange={() => setCancelFutureInterest(opt.value)}
                      style={{ accentColor: '#AD974F' }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Refund Settlement Details Box */}
            <div className="p-md rounded" style={{ background: '#1c1917', border: '1px solid rgba(173, 151, 79, 0.3)' }}>
              <div className="text-xs font-black uppercase mb-xs" style={{ color: 'var(--brand, #AD974F)' }}>
                Refund Summary &amp; Settlement
              </div>
              <div className="flex justify-between items-center py-xs text-xs">
                <span style={{ color: '#94a3b8' }}>Original Price Paid:</span>
                <span className="font-bold" style={{ color: '#ffffff' }}>₹{Number(ticketToCancel.price || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-xs text-xs">
                <span style={{ color: '#94a3b8' }}>Cancellation Penalty:</span>
                <span className="font-bold" style={{ color: '#22c55e' }}>₹0.00 (Zero Penalty / Free)</span>
              </div>
              <div className="flex justify-between items-center pt-xs border-t text-sm font-black" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span style={{ color: '#ffffff' }}>Amount to Refund:</span>
                <span style={{ color: '#22c55e' }}>₹{Number(ticketToCancel.price || 0).toLocaleString()}</span>
              </div>
              <div className="text-xs mt-xs" style={{ color: '#64748b' }}>
                Credited automatically to: Original Payment Method (UPI / Bank)
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Post-Cancellation Feedback Modal (For tickets cancelled previously) */}
      <Modal
        isOpen={Boolean(postCancelFeedbackTicket)}
        onClose={() => setPostCancelFeedbackTicket(null)}
        size="md"
        title="Leave Cancellation Feedback"
        footer={
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              className="btn btn-secondary font-black uppercase text-xs"
              onClick={() => setPostCancelFeedbackTicket(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary font-black uppercase text-xs"
              onClick={handleSavePostCancelFeedback}
              id="submit-post-feedback-btn"
            >
              Save Feedback
            </button>
          </div>
        }
      >
        {postCancelFeedbackTicket && (
          <div className="flex flex-col gap-md">
            <div>
              <label className="text-xs font-black uppercase mb-xs block" style={{ color: '#ffffff' }}>
                Primary Cancellation Reason
              </label>
              <select
                className="form-input"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                style={{ width: '100%', background: '#1c1917', color: '#ffffff', borderColor: '#AD974F' }}
              >
                {CANCELLATION_REASONS.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-black uppercase mb-xs block" style={{ color: '#ffffff' }}>
                Feedback / Comments
              </label>
              <textarea
                className="form-input"
                placeholder="What could be improved?"
                value={cancelComment}
                onChange={e => setCancelComment(e.target.value)}
                rows={3}
                style={{ width: '100%', resize: 'none', background: '#1c1917', color: '#ffffff', borderColor: '#AD974F' }}
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase mb-xs block" style={{ color: '#ffffff' }}>
                Experience Rating
              </label>
              <div className="flex gap-sm">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCancelRating(star)}
                    className="flex-center font-black p-xs rounded"
                    style={{
                      flex: 1,
                      height: 36,
                      background: cancelRating >= star ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: cancelRating >= star ? '1px solid #eab308' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: cancelRating >= star ? '#eab308' : '#64748b',
                    }}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Official Refund Receipt Modal */}
      <Modal
        isOpen={Boolean(refundReceiptTicket)}
        onClose={() => setRefundReceiptTicket(null)}
        size="md"
        title="Official Refund Receipt"
        footer={
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              className="btn btn-primary font-black uppercase text-xs flex items-center"
              onClick={() => window.print()}
              id="print-refund-receipt-btn"
            >
              Print Receipt
            </button>
            <button
              className="btn btn-secondary font-black uppercase text-xs"
              onClick={() => setRefundReceiptTicket(null)}
            >
              Close
            </button>
          </div>
        }
      >
        {refundReceiptTicket && (
          <div className="p-lg rounded" style={{ background: '#ffffff', color: '#000000', border: '2px solid #AD974F' }}>
            {/* Receipt Header */}
            <div className="text-center pb-md border-b mb-md" style={{ borderColor: '#e2e8f0' }}>
              <div className="text-xs font-black tracking-widest uppercase" style={{ color: '#AD974F' }}>
                EVENTPRO ENTERPRISE
              </div>
              <h2 className="text-xl font-black uppercase mt-xs" style={{ color: '#000000' }}>
                Payment Refund Receipt
              </h2>
              <div className="text-xs font-mono mt-xs" style={{ color: '#64748b' }}>
                Ref ID: {refundReceiptTicket.refundTxnId || `REF-${refundReceiptTicket.id}`}
              </div>
            </div>

            {/* Receipt Details Table */}
            <div className="flex flex-col gap-sm text-xs">
              <div className="flex justify-between py-xs border-b" style={{ borderColor: '#f1f5f9' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Refund Status:</span>
                <span className="font-black uppercase" style={{ color: '#16a34a' }}>
                  COMPLETED &amp; CREDITED
                </span>
              </div>
              <div className="flex justify-between py-xs border-b" style={{ borderColor: '#f1f5f9' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Event Name:</span>
                <span className="font-bold uppercase text-right" style={{ color: '#000000', maxWidth: '60%' }}>
                  {refundReceiptTicket.eventTitle || refundReceiptTicket.event?.title || 'Featured Event'}
                </span>
              </div>
              <div className="flex justify-between py-xs border-b" style={{ borderColor: '#f1f5f9' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Original Ticket:</span>
                <span className="font-mono font-bold" style={{ color: '#000000' }}>
                  #{refundReceiptTicket.ticketNumber || refundReceiptTicket.id}
                </span>
              </div>
              <div className="flex justify-between py-xs border-b" style={{ borderColor: '#f1f5f9' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Seats Cancelled:</span>
                <span className="font-bold" style={{ color: '#000000' }}>
                  {refundReceiptTicket.seats || 1} Seat(s)
                </span>
              </div>
              <div className="flex justify-between py-xs border-b" style={{ borderColor: '#f1f5f9' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Refund Method:</span>
                <span className="font-bold" style={{ color: '#000000' }}>
                  {refundReceiptTicket.refundMethod || 'Original Payment Source (UPI / Bank)'}
                </span>
              </div>
              <div className="flex justify-between py-xs border-b" style={{ borderColor: '#f1f5f9' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Feedback Logged:</span>
                <span className="font-bold" style={{ color: '#16a34a' }}>
                  Yes (Recorded for Organizers)
                </span>
              </div>
              <div className="flex justify-between py-xs border-b" style={{ borderColor: '#f1f5f9' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Processed Date:</span>
                <span className="font-bold" style={{ color: '#000000' }}>
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Total Amount Box */}
            <div className="mt-lg p-md rounded text-center" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <div className="text-xs uppercase font-bold" style={{ color: '#64748b' }}>
                Amount Refunded to User
              </div>
              <div className="text-2xl font-black mt-xs" style={{ color: '#16a34a' }}>
                ₹{Number(refundReceiptTicket.refundAmount || refundReceiptTicket.price || 0).toLocaleString()}
              </div>
              <div className="text-xs font-semibold mt-xs" style={{ color: '#64748b' }}>
                Zero cancellation fees applied (100% full refund)
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Printable Ticket Modal */}
      <Modal
        isOpen={Boolean(selectedTicketForPrint)}
        onClose={() => setSelectedTicketForPrint(null)}
        size="lg"
        title="Official Event Ticket"
        footer={
          <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              className="btn btn-primary font-black uppercase text-xs flex items-center gap-xs"
              onClick={() => window.print()}
              id="my-tickets-print-btn"
            >
              Print Ticket
            </button>
            <button
              className="btn btn-secondary font-black uppercase text-xs"
              onClick={() => setSelectedTicketForPrint(null)}
            >
              Close
            </button>
          </div>
        }
      >
        <TicketPass
          ticket={selectedTicketForPrint}
          onPrint={() => window.print()}
          onClose={() => setSelectedTicketForPrint(null)}
        />
      </Modal>
    </DashboardLayout>
  );
}
