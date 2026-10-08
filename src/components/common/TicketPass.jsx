import React from 'react';

/**
 * High-fidelity, authentic Printable Ticket Pass Component
 * Renders an official event boarding pass / ticket with QR code, barcode,
 * attendee info, seat allocation, and print-optimized styles.
 */
export default function TicketPass({ ticket, onPrint, onClose }) {
  if (!ticket) return null;

  const eventDateStr = ticket.eventDate 
    ? new Date(ticket.eventDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Date TBA';

  const purchaseDateStr = ticket.purchasedAt
    ? new Date(ticket.purchasedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="ticket-pass-wrapper">
      {/* Action Bar (hidden in print) */}
      <div className="ticket-actions-bar no-print">
        <div className="ticket-actions-left">
          <span className="badge badge-success font-black text-xs uppercase">
            Booking Confirmed
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Ticket ID: <strong style={{ color: 'var(--text)' }}>#{ticket.ticketNumber || ticket.id}</strong>
          </span>
        </div>
        <div className="ticket-actions-right">
          <button
            type="button"
            className="btn btn-primary btn-sm flex items-center font-black uppercase"
            onClick={handlePrint}
            id="print-ticket-btn"
          >
            Print Ticket
          </button>
        </div>
      </div>

      {/* Printable Ticket Card */}
      <div id="printable-ticket" className="ticket-pass-card">
        {/* Top Gold Stripe / Branding */}
        <div className="ticket-header-band">
          <div className="ticket-brand">
            <div>
              <div className="ticket-brand-title">EVENTPRO ENTERTAINMENT</div>
              <div className="ticket-brand-subtitle">OFFICIAL ADMISSION PASS</div>
            </div>
          </div>
          <div className="ticket-meta-tag">
            <span>{ticket.ticketType ? ticket.ticketType.toUpperCase() : 'GENERAL ADMISSION'}</span>
          </div>
        </div>

        {/* Main Body + Stub Grid */}
        <div className="ticket-inner-grid">
          {/* Main Pass Section */}
          <div className="ticket-main-section">
            <div className="ticket-event-title-wrap">
              <span className="ticket-category-pill">
                {ticket.eventCategory ? ticket.eventCategory.toUpperCase() : 'LIVE EVENT'}
              </span>
              <h2 className="ticket-event-name">{ticket.eventTitle || 'Featured Event'}</h2>
            </div>

            <div className="ticket-details-grid">
              <div className="ticket-detail-item">
                <span className="ticket-detail-label">DATE</span>
                <span className="ticket-detail-value font-black">{eventDateStr}</span>
              </div>
              <div className="ticket-detail-item">
                <span className="ticket-detail-label">TIME</span>
                <span className="ticket-detail-value">{ticket.eventTime || '10:00 AM IST'}</span>
              </div>
              <div className="ticket-detail-item span-2">
                <span className="ticket-detail-label">VENUE & LOCATION</span>
                <span className="ticket-detail-value">{ticket.venue || 'Main Auditorium / Arena'}</span>
              </div>
              <div className="ticket-detail-item">
                <span className="ticket-detail-label">ATTENDEE</span>
                <span className="ticket-detail-value">{ticket.userName || 'Valued Guest'}</span>
              </div>
              <div className="ticket-detail-item">
                <span className="ticket-detail-label">ADMIT COUNT</span>
                <span className="ticket-detail-value font-black">{ticket.seats || 1} SEAT{(ticket.seats || 1) > 1 ? 'S' : ''}</span>
              </div>
              <div className="ticket-detail-item">
                <span className="ticket-detail-label">AMOUNT PAID</span>
                <span className="ticket-detail-value font-black price-highlight">
                  ₹{Number(ticket.price || 0).toLocaleString()}
                </span>
              </div>
              <div className="ticket-detail-item">
                <span className="ticket-detail-label">STATUS</span>
                <span className="ticket-detail-value status-badge">
                  {(ticket.status || 'ACTIVE').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Barcode Strip */}
            <div className="ticket-barcode-strip">
              <div className="barcode-bars">
                {/* SVG Vector Barcode for crisp print and render */}
                <svg width="240" height="36" viewBox="0 0 240 36" fill="currentColor">
                  {/* Alternating stylized barcode vertical stripes */}
                  <rect x="0" y="0" width="3" height="36" />
                  <rect x="5" y="0" width="1" height="36" />
                  <rect x="8" y="0" width="4" height="36" />
                  <rect x="14" y="0" width="2" height="36" />
                  <rect x="18" y="0" width="1" height="36" />
                  <rect x="22" y="0" width="5" height="36" />
                  <rect x="29" y="0" width="2" height="36" />
                  <rect x="33" y="0" width="4" height="36" />
                  <rect x="39" y="0" width="1" height="36" />
                  <rect x="42" y="0" width="3" height="36" />
                  <rect x="47" y="0" width="2" height="36" />
                  <rect x="51" y="0" width="5" height="36" />
                  <rect x="58" y="0" width="1" height="36" />
                  <rect x="61" y="0" width="3" height="36" />
                  <rect x="66" y="0" width="4" height="36" />
                  <rect x="72" y="0" width="2" height="36" />
                  <rect x="76" y="0" width="1" height="36" />
                  <rect x="80" y="0" width="5" height="36" />
                  <rect x="87" y="0" width="3" height="36" />
                  <rect x="92" y="0" width="1" height="36" />
                  <rect x="95" y="0" width="4" height="36" />
                  <rect x="101" y="0" width="2" height="36" />
                  <rect x="105" y="0" width="3" height="36" />
                  <rect x="110" y="0" width="1" height="36" />
                  <rect x="113" y="0" width="4" height="36" />
                  <rect x="119" y="0" width="2" height="36" />
                  <rect x="123" y="0" width="5" height="36" />
                  <rect x="130" y="0" width="1" height="36" />
                  <rect x="133" y="0" width="3" height="36" />
                  <rect x="138" y="0" width="2" height="36" />
                  <rect x="142" y="0" width="4" height="36" />
                  <rect x="148" y="0" width="1" height="36" />
                  <rect x="151" y="0" width="5" height="36" />
                  <rect x="158" y="0" width="2" height="36" />
                  <rect x="162" y="0" width="4" height="36" />
                  <rect x="168" y="0" width="1" height="36" />
                  <rect x="171" y="0" width="3" height="36" />
                  <rect x="176" y="0" width="2" height="36" />
                  <rect x="180" y="0" width="5" height="36" />
                  <rect x="187" y="0" width="1" height="36" />
                  <rect x="190" y="0" width="4" height="36" />
                  <rect x="196" y="0" width="2" height="36" />
                  <rect x="200" y="0" width="3" height="36" />
                  <rect x="205" y="0" width="1" height="36" />
                  <rect x="208" y="0" width="4" height="36" />
                  <rect x="214" y="0" width="2" height="36" />
                  <rect x="218" y="0" width="5" height="36" />
                  <rect x="225" y="0" width="3" height="36" />
                  <rect x="230" y="0" width="1" height="36" />
                  <rect x="233" y="0" width="4" height="36" />
                </svg>
              </div>
              <div className="ticket-serial-text">
                *{ticket.ticketNumber || ticket.id}*
              </div>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="ticket-stub-divider">
            <div className="stub-notch notch-top"></div>
            <div className="stub-dashed-line"></div>
            <div className="stub-notch notch-bottom"></div>
          </div>

          {/* Stub / QR Section */}
          <div className="ticket-stub-section">
            <div className="ticket-stub-header">
              <span className="stub-label">ADMIT PASS</span>
              <span className="stub-number">#{ticket.ticketNumber || ticket.id}</span>
            </div>

            {/* QR Code Presentation */}
            <div className="ticket-qr-container">
              <svg width="108" height="108" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background */}
                <rect width="108" height="108" fill="#ffffff" rx="6" />
                
                {/* Top-Left Finder Pattern */}
                <rect x="8" y="8" width="28" height="28" stroke="#111827" strokeWidth="4" fill="none" />
                <rect x="16" y="16" width="12" height="12" fill="#111827" />

                {/* Top-Right Finder Pattern */}
                <rect x="72" y="8" width="28" height="28" stroke="#111827" strokeWidth="4" fill="none" />
                <rect x="80" y="16" width="12" height="12" fill="#111827" />

                {/* Bottom-Left Finder Pattern */}
                <rect x="8" y="72" width="28" height="28" stroke="#111827" strokeWidth="4" fill="none" />
                <rect x="16" y="80" width="12" height="12" fill="#111827" />

                {/* Simulated Data Pattern Blocks */}
                <rect x="42" y="10" width="6" height="6" fill="#111827" />
                <rect x="54" y="10" width="10" height="6" fill="#111827" />
                <rect x="42" y="22" width="10" height="6" fill="#111827" />
                <rect x="58" y="22" width="6" height="6" fill="#111827" />
                
                <rect x="10" y="42" width="6" height="6" fill="#111827" />
                <rect x="22" y="42" width="10" height="6" fill="#111827" />
                <rect x="38" y="38" width="8" height="8" fill="#AD974F" />
                <rect x="52" y="38" width="6" height="6" fill="#111827" />
                <rect x="64" y="42" width="8" height="8" fill="#111827" />
                <rect x="78" y="42" width="6" height="6" fill="#111827" />
                <rect x="90" y="42" width="8" height="6" fill="#111827" />

                <rect x="10" y="54" width="8" height="6" fill="#111827" />
                <rect x="24" y="54" width="6" height="6" fill="#111827" />
                <rect x="36" y="52" width="8" height="8" fill="#111827" />
                <rect x="50" y="50" width="8" height="8" fill="#AD974F" />
                <rect x="64" y="54" width="6" height="6" fill="#111827" />
                <rect x="76" y="52" width="8" height="8" fill="#111827" />
                <rect x="90" y="54" width="6" height="6" fill="#111827" />

                <rect x="42" y="70" width="6" height="6" fill="#111827" />
                <rect x="54" y="72" width="10" height="6" fill="#111827" />
                <rect x="70" y="70" width="6" height="8" fill="#111827" />
                <rect x="82" y="72" width="14" height="6" fill="#111827" />

                <rect x="42" y="86" width="10" height="6" fill="#111827" />
                <rect x="58" y="84" width="6" height="8" fill="#111827" />
                <rect x="72" y="86" width="12" height="6" fill="#111827" />
                <rect x="90" y="86" width="6" height="6" fill="#111827" />
              </svg>
              <div className="qr-scan-text">SCAN FOR ENTRY</div>
            </div>

            <div className="ticket-stub-details">
              <div>
                <span className="stub-sublabel">TYPE</span>
                <span className="stub-subvalue">{ticket.ticketType || 'REGULAR'}</span>
              </div>
              <div>
                <span className="stub-sublabel">SEATS</span>
                <span className="stub-subvalue">{ticket.seats || 1}</span>
              </div>
              <div>
                <span className="stub-sublabel">DATE</span>
                <span className="stub-subvalue">{purchaseDateStr}</span>
              </div>
            </div>

            <div className="stub-security-note">
              NON-TRANSFERABLE • PRESENT AT GATE
            </div>
          </div>
        </div>

        {/* Bottom Safety & Instruction Strip */}
        <div className="ticket-footer-strip">
          <span>Notice: Entry subject to venue guidelines. Please carry a valid government photo ID matching attendee name.</span>
          <span className="ticket-auth-badge">GENUINE TICKET VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
