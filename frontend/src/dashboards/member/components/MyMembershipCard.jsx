import React, { useState } from 'react';
import { RealQRCode } from '../../../components/RealQRCode';

/* ── SVG Icons ── */
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function MyMembershipCard({ profile }) {
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewalSuccess, setRenewalSuccess] = useState(false);

  const handleRenew = (e) => {
    e.preventDefault();
    setRenewalSuccess(true);
    setTimeout(() => {
      setIsRenewModalOpen(false);
      setRenewalSuccess(false);
    }, 1800);
  };

  return (
    <div className="my-membership-view">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <div>
            <h3 className="skyline-card-title">
              <IconShield />
              <span>Digital Membership Pass & Standing</span>
            </h3>
            <p className="skyline-card-subtitle">Official verified club credentials for active organization participation</p>
          </div>
          <span className="skyline-badge badge-approved">{profile.membershipStatus}</span>
        </div>

        {/* ── Main Digital Pass Card ── */}
        <div className="digital-id-card-container">
          <div className="digital-id-card">
            {/* Top Brand Stripe */}
            <div className="id-card-top">
              <div className="id-brand-box">
                <div className="id-brand-logo">S</div>
                <div>
                  <div className="id-brand-title">Skyline Student Organization</div>
                  <div className="id-brand-sub">University Chapter • Accredited Campus Body</div>
                </div>
              </div>
              <div className="id-status-badge">
                <IconCheck />
                <span>ACTIVE PASS</span>
              </div>
            </div>

            {/* Middle Profile Section */}
            <div className="id-card-middle">
              <div className="id-avatar-box">
                <div className="id-avatar-circle">{profile.avatarInitials}</div>
              </div>
              <div className="id-info-col">
                <h2 className="id-user-name">{profile.name}</h2>
                <div className="id-user-email">{profile.email}</div>
                <div className="id-meta-grid">
                  <div className="id-meta-item">
                    <span className="id-meta-label">Member ID</span>
                    <span className="id-meta-val">{profile.digitalPassId}</span>
                  </div>
                  <div className="id-meta-item">
                    <span className="id-meta-label">Department</span>
                    <span className="id-meta-val">{profile.department}</span>
                  </div>
                  <div className="id-meta-item">
                    <span className="id-meta-label">Member Tier</span>
                    <span className="id-meta-val">{profile.membershipTier}</span>
                  </div>
                  <div className="id-meta-item">
                    <span className="id-meta-label">Valid Thru</span>
                    <span className="id-meta-val">{profile.expiresOn}</span>
                  </div>
                </div>
              </div>

              {/* Verified Digital Credential QR */}
              <div className="id-qr-box" style={{ padding: '4px' }}>
                <RealQRCode
                  token={`SKYLINE-MEMBER-${profile.studentId || profile.name || 'ACTIVE'}`}
                  size={68}
                  label="VERIFIED"
                />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="id-card-bottom">
              <div className="id-validity-text">
                Enrolled since {profile.memberSince} • Entitled to club events, voting & project participation
              </div>
              <button
                type="button"
                className="btn-renew-action"
                onClick={() => setIsRenewModalOpen(true)}
              >
                Request Renewal
              </button>
            </div>
          </div>
        </div>

        {/* ── Membership Privileges & Information ── */}
        <div className="membership-benefits-grid">
          <div className="benefit-card">
            <h4>Event Admission</h4>
            <p>Free or discounted priority passes to all Skyline hackathons, workshops, and campus networking sessions.</p>
          </div>
          <div className="benefit-card">
            <h4>Project Funding & Claims</h4>
            <p>Access to personal expense reimbursement submissions for approved club project materials and workshops.</p>
          </div>
          <div className="benefit-card">
            <h4>Leadership & Voting</h4>
            <p>Eligible to run for department lead positions, join committee boards, and vote in annual general elections.</p>
          </div>
        </div>
      </div>

      {/* ── Renewal Modal ── */}
      {isRenewModalOpen && (
        <div className="skyline-modal-overlay" onClick={() => setIsRenewModalOpen(false)}>
          <div className="skyline-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="skyline-modal-header">
              <h3>Extend Membership Standing</h3>
              <button onClick={() => setIsRenewModalOpen(false)}>&times;</button>
            </div>
            {renewalSuccess ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#059669' }}>
                <strong>Renewal request submitted successfully!</strong>
                <p style={{ fontSize: '13px', color: '#667085', marginTop: '6px' }}>
                  The executive committee has received your renewal request.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRenew} className="skyline-modal-body">
                <div className="form-group">
                  <label>Current Member ID</label>
                  <input type="text" readOnly value={profile.digitalPassId} />
                </div>
                <div className="form-group">
                  <label>Renewal Term</label>
                  <select defaultValue="1year" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E6F0' }}>
                    <option value="1year">1 Academic Year (through May 2028)</option>
                    <option value="semester">1 Fall Semester (through Dec 2027)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Verification Notes</label>
                  <textarea
                    placeholder="Provide any updated student enrollment status or department notes..."
                    rows="3"
                  />
                </div>
                <div className="skyline-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setIsRenewModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Submit Renewal Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyMembershipCard;
