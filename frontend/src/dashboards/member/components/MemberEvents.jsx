import React from 'react';

export function MemberEvents() {
  return (
    <div className="member-events-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Discover Campus Events</h3>
          <p className="skyline-card-subtitle">Browse upcoming events and RSVP directly with your member account</p>
        </div>
        <div className="skyline-card-body">
          <p className="text-secondary">Integrates with `frontend/src/features/events/Events.jsx` in member mode.</p>
        </div>
      </div>
    </div>
  );
}

export default MemberEvents;
