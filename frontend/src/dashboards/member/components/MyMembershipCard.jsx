import React from 'react';

export function MyMembershipCard({ profile }) {
  return (
    <div className="my-membership-card-wrapper">
      <div className="skyline-card digital-pass-card">
        <div className="digital-pass-header">
          <div className="pass-brand">SKYLINE MEMBER PASS</div>
          <span className="skyline-badge badge-approved">{profile.membershipStatus}</span>
        </div>
        <div className="digital-pass-body">
          <img src={profile.avatarUrl} alt={profile.name} className="pass-avatar" />
          <div className="pass-details">
            <h2 className="pass-user-name">{profile.name}</h2>
            <p className="pass-user-email">{profile.email}</p>
            <div className="pass-meta-row">
              <span>Member ID: <strong>{profile.digitalPassId}</strong></span>
              <span>Valid Thru: <strong>{profile.expiresOn}</strong></span>
            </div>
          </div>
        </div>
        <div className="digital-pass-footer">
          <button className="btn-renew-membership">Renew Membership</button>
        </div>
      </div>
    </div>
  );
}

export default MyMembershipCard;
