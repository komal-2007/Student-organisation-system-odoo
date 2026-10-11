import React, { useState } from 'react';
import { skylineApi } from '../../../services/api/skylineApi';
import { RealQRCode } from '../../../components/RealQRCode';

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

export function MyTickets({ tickets = [] }) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [qrVerifyStatus, setQrVerifyStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const displayValue = (value) => value || 'Not provided';

  const handleVerifyQr = async (ticket) => {
    setIsVerifying(true);
    setQrVerifyStatus(null);
    try {
      const res = await skylineApi.verifyTicketQr(ticket.qrToken || `QR-TOKEN-${ticket.ticketNumber || ticket.ticketCode}`);
      setQrVerifyStatus({ success: true, message: res.message });
      if (res.ticket) {
        ticket.status = res.ticket.status;
      }
    } catch (err) {
      setQrVerifyStatus({ success: false, message: err.message || 'QR Verification failed.' });
    } finally {
      setIsVerifying(false);
    }
  };

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

        {tickets.length === 0 ? (
          <div className="admin-events-empty" style={{ padding: '32px 20px' }}>
            <IconTicket />
            <p className="admin-events-empty-title">No event passes yet</p>
            <p className="admin-events-empty-sub">Your confirmed admissions will appear here after you reserve a pass.</p>
          </div>
        ) : (
        <div className="tickets-grid">
          {tickets.map((tkt) => (
            <div key={tkt.id} className="ticket-card-expanded">
              {/* Ticket Top */}
              <div className="ticket-card-top">
                <span className="skyline-badge badge-approved">{tkt.status}</span>
                <span className="ticket-tier-tag">{displayValue(tkt.category)}</span>
              </div>

              {/* Title & Type */}
              <h4 className="ticket-event-heading">{displayValue(tkt.eventTitle)}</h4>
              <div className="ticket-type-label">{displayValue(tkt.ticketType)}</div>

              {/* Meta Rows */}
              <div className="ticket-details-meta">
                <div className="ticket-meta-row">
                  <IconCalendar />
                  <span>{displayValue(tkt.date)}</span>
                </div>
                <div className="ticket-meta-row">
                  <IconClock />
                  <span>{displayValue(tkt.time)}</span>
                </div>
                <div className="ticket-meta-row">
                  <IconMapPin />
                  <span>{displayValue(tkt.venue)}</span>
                </div>
              </div>

              {/* Ticket QR Strip */}
              <div className="ticket-qr-strip">
                <RealQRCode
                  token={tkt.status !== 'CANCELLED' ? (tkt.qrToken || `QR-TOKEN-${tkt.ticketNumber || tkt.ticketCode || tkt.id}`) : ''}
                  size={52}
                  status={tkt.status}
                />
                <div className="qr-info-wrap">
                  <span className="qr-code-label">TICKET ID</span>
                  <code className="qr-code-id">{displayValue(tkt.ticketNumber || tkt.ticketCode)}</code>
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
        )}
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
                {displayValue(selectedTicket.eventTitle)}
              </h2>
              <p style={{ fontSize: '13px', color: '#667085', margin: '0 0 20px' }}>
                {displayValue(selectedTicket.ticketType)}
              </p>

              <div style={{
                padding: '20px',
                backgroundColor: '#F4F5FB',
                borderRadius: '12px',
                border: '1px solid #E2E6F0',
                display: 'inline-block',
                margin: '0 auto 20px',
                textAlign: 'center'
              }}>
                <RealQRCode
                  token={selectedTicket.status !== 'CANCELLED' ? (selectedTicket.qrToken || `QR-TOKEN-${selectedTicket.ticketNumber || selectedTicket.ticketCode || selectedTicket.id}`) : ''}
                  size={140}
                  label={selectedTicket.status === 'USED' ? 'ALREADY CHECKED IN' : selectedTicket.status === 'VALID' ? 'SCAN AT ENTRANCE' : 'UNAVAILABLE'}
                  status={selectedTicket.status}
                />
                <div style={{ marginTop: '10px' }}>
                  <code style={{ fontSize: '13px', fontWeight: 700, color: '#101426' }}>
                    {displayValue(selectedTicket.ticketNumber || selectedTicket.ticketCode)}
                  </code>
                </div>
              </div>

              {qrVerifyStatus && (
                <div style={{ padding: '10px 14px', marginBottom: '14px', borderRadius: '6px', background: qrVerifyStatus.success ? '#ECFDF3' : '#FEF3F2', color: qrVerifyStatus.success ? '#027A48' : '#B42318', fontSize: '13px' }}>
                  {qrVerifyStatus.message}
                </div>
              )}

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
                <div><strong>Date:</strong> {displayValue(selectedTicket.date)}</div>
                <div><strong>Time:</strong> {displayValue(selectedTicket.time)}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Venue:</strong> {displayValue(selectedTicket.venue)}</div>
              </div>
            </div>
            <div className="skyline-modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn-submit"
                disabled={isVerifying || selectedTicket.status === 'USED'}
                onClick={() => handleVerifyQr(selectedTicket)}
              >
                {isVerifying ? 'Verifying...' : selectedTicket.status === 'USED' ? 'Ticket Already Checked In' : 'Validate Server QR Check-in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTickets;
