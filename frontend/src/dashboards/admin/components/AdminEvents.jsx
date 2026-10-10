import React from 'react';

export function AdminEvents() {
  return (
    <div className="admin-events-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Event Administration & Capacity</h3>
          <p className="skyline-card-subtitle">Manage campus event creation, ticket caps, and publishing status</p>
        </div>
        <div className="skyline-card-body">
          <p className="text-secondary">
            Integrates directly with the <strong>Events Module</strong> (`frontend/src/features/events/Events.jsx`). Admin overrides allow setting capacity limits, publishing drafts, and reviewing attendee lists.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminEvents;
