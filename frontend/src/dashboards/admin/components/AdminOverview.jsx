import React from 'react';

export function AdminOverview({ data }) {
  return (
    <div className="admin-overview-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Executive Command Center</h3>
          <p className="skyline-card-subtitle">Organization status and real-time operational metrics</p>
        </div>
        <div className="skyline-card-body">
          <div className="admin-activity-grid">
            <div className="activity-item">
              <span className="activity-badge alert">Pending</span>
              <div>
                <strong>Reimbursement Request #rmb-101</strong> submitted by Sarah Jenkins ($145.50)
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-badge success">New Member</span>
              <div>
                <strong>David Chen</strong> requested to join Tech Department
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-badge info">Event Update</span>
              <div>
                <strong>HackCampus 2026</strong> reached 87% capacity (218 / 250 registered)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
