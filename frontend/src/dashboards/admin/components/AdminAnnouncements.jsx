import React from 'react';

export function AdminAnnouncements() {
  return (
    <div className="admin-announcements-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Broadcast Announcements Publisher</h3>
          <p className="skyline-card-subtitle">Publish club-wide alerts and updates for members</p>
        </div>
        <div className="skyline-card-body">
          <p className="text-secondary">Integrates with `frontend/src/features/announcements/Announcements.jsx` for broadcasting announcements.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminAnnouncements;
