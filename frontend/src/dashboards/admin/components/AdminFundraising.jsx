import React from 'react';

export function AdminFundraising({ campaigns }) {
  return (
    <div className="admin-fundraising-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Fundraising Campaigns</h3>
          <p className="skyline-card-subtitle">Track organization fundraising targets and progress</p>
        </div>
        <div className="skyline-card-body">
          {campaigns.map((cmp) => (
            <div key={cmp.id} className="fundraising-item">
              <div className="fundraising-header">
                <strong>{cmp.title}</strong>
                <span>{cmp.raised} / {cmp.target} ({cmp.percentage}%)</span>
              </div>
              <div className="skyline-progress-track">
                <div className="skyline-progress-fill" style={{ width: `${cmp.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminFundraising;
