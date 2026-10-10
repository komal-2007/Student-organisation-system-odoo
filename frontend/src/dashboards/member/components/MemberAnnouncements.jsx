import React from 'react';

export function MemberAnnouncements() {
  return (
    <div className="member-announcements-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Member Announcements Feed</h3>
          <p className="skyline-card-subtitle">Official organization updates, deadline alerts, and newsletters</p>
        </div>
        <div className="skyline-card-body">
          <p className="text-secondary">Integrates with `frontend/src/features/announcements/Announcements.jsx` in member view mode.</p>
        </div>
      </div>
    </div>
  );
}

export default MemberAnnouncements;
