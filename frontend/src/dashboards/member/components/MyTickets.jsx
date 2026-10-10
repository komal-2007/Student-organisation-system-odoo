import React, { useState } from 'react';

/* ── Outline SVG Icons ── */
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconTicket = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
  </svg>
);

const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export function MyTickets({ tickets }) {
  const [selectedTicket, setSelectedTicket] = useState(null);

  return (
    <div className="my-tickets-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <div>
            <h3 className="skyline-card-title">
              <IconTicket />
              <span>My Event Passes & Registration Passes</span>
            </h3>
            <p className="skyline-card-subtitle">
              Confirmed event tickets and door admission credentials reserved under your student profile
            </p>
          </div>
          <span className="skyline-badge badge-active">{tickets.length} Confirmed</span>
        </div>

        <div className="tickets-grid">
          {tickets.map((tkt) => (
            <div key={tkt.id} className="ticket-card-expanded">
              {/* Ticket Top */}
              <div className="ticket-card-top">
                <span className="skyline-badge badge-approved">{tkt.status}</span>
                <span className="ticket-tier-tag">{tkt.category}</span>
              </div>

              {/* Title & Type */}
              <h4 className="ticket-event-heading">{tkt.eventTitle}</h4>
              <div className="ticket-type-label">{tkt.ticketType}</div>

              {/* Meta Rows */}
              <div className="ticket-details-meta">
                <div className="ticket-meta-row">
                  <IconCalendar />
                  <span>{tkt.date}</span>
                </div>
                <div className="ticket-meta-row">
                  <IconClock />
                  <span>{tkt.time}</span>
                </div>
                <div className="ticket-meta-row">
                  <IconMapPin />
                  <span>{tkt.venue}</span>
                </div>
              </div>

              {/* Ticket QR Strip */}
              <div className="ticket-qr-strip">
                <div className="qr-box-small">
                  <div className="qr-mock-matrix">
                    <div className="qr-cell" />
                    <div className="qr-cell fill" />
                    <div className="qr-cell fill" />
                    <div className="qr-cell" />
                    <div className="qr-cell fill" />
                    <div className="qr-cell fill" />
                    <div className="qr-cell fill" />
                    <div className="qr-cell" />
                    <div className="qr-cell fill" />
                  </div>
                </div>
                <div className="qr-info-wrap">
                  <span className="qr-code-label">TICKET ID</span>
                  <code className="qr-code-id">{tkt.ticketCode}</code>
                </div>
              </div>

              {/* Ticket Action Buttons */}
              <div className="ticket-card-actions">
                <button
                  type="button"
                  className="btn-ticket-primary"
                  onClick={() => setSelectedTicket(tkt)}
                >
                  View Digital Pass
                </button>
                <button
                  type="button"
                  className="btn-ticket-secondary"
                  onClick={() => alert(`Downloading pass for ${tkt.eventTitle}...`)}
                >
                  <IconDownload />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pass Detail Modal ── */}
      {selectedTicket && (
        <div className="skyline-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="skyline-modal-content pass-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="skyline-modal-header">
              <h3>Event Admission Pass</h3>
              <button onClick={() => setSelectedTicket(null)}>&times;</button>
            </div>
            <div className="skyline-modal-body" style={{ textAlign: 'center', padding: '24px' }}>
              <span className="skyline-badge badge-approved" style={{ marginBottom: '12px' }}>
                {selectedTicket.status}
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#101426', margin: '0 0 6px' }}>
                {selectedTicket.eventTitle}
              </h2>
              <p style={{ fontSize: '13px', color: '#667085', margin: '0 0 20px' }}>
                {selectedTicket.ticketType}
              </p>

              <div style={{
                padding: '24px',
                backgroundColor: '#F4F5FB',
                borderRadius: '12px',
                border: '1px solid #E2E6F0',
                display: 'inline-block',
                margin: '0 auto 20px'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #101426',
                  borderRadius: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '4px',
                  padding: '8px',
                  margin: '0 auto 12px'
                }}>
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: (i % 2 === 0 || i % 5 === 0) ? '#101426' : 'transparent',
                        borderRadius: '1px'
                      }}
                    />
                  ))}
                </div>
                <code style={{ fontSize: '13px', fontWeight: 700, color: '#101426' }}>
                  {selectedTicket.ticketCode}
                </code>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                textAlign: 'left',
                backgroundColor: '#ffffff',
                border: '1px solid #E2E6F0',
                borderRadius: '8px',
                padding: '14px 18px',
                fontSize: '13px'
              }}>
                <div><strong>Date:</strong> {selectedTicket.date}</div>
                <div><strong>Time:</strong> {selectedTicket.time}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Venue:</strong> {selectedTicket.venue}</div>
              </div>
            </div>
            <div className="skyline-modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={() => {
                  alert('Pass downloaded!');
                  setSelectedTicket(null);
                }}
              >
                Download PDF Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTickets;
