import React from 'react';

export function MyTickets({ tickets }) {
  return (
    <div className="my-tickets-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">My Event Passes & Registration QR</h3>
          <p className="skyline-card-subtitle">Confirmed event tickets reserved under your account</p>
        </div>
        <div className="skyline-card-body">
          <div className="tickets-grid">
            {tickets.map((tkt) => (
              <div key={tkt.id} className="ticket-item-card">
                <div className="ticket-item-status">{tkt.status}</div>
                <h4 className="ticket-event-title">{tkt.eventTitle}</h4>
                <div className="ticket-meta">
                  <div>📅 {tkt.date} at {tkt.time}</div>
                  <div>📍 {tkt.venue}</div>
                </div>
                <div className="ticket-qr-placeholder">
                  <code>{tkt.ticketCode}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyTickets;
