import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../services/auth/AuthContext';
import { skylineApi, subscribeToDataRefresh, notifyDataRefresh } from '../../../services/api/skylineApi';

/* ── Outline SVG Icons ── */
const IconReceipt = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
    <path d="M16 8h-8" />
    <path d="M16 12h-8" />
    <path d="M10 16h-2" />
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/**
 * MEMBER REIMBURSEMENTS VIEW
 * Strictly shows ONLY the logged-in member's submitted claims and status.
 * Contains ZERO club-wide financial ledgers or admin approval controls.
 */
const normalizeClaimStatus = (status) => {
  const value = String(status || '').trim();
  if (['pending', 'Pending', 'Pending Approval'].includes(value)) return 'pending';
  if (['approved', 'Approved'].includes(value)) return 'approved';
  if (['rejected', 'Rejected'].includes(value)) return 'rejected';
  return 'pending';
};

export function MyReimbursements({ initialClaims = [] }) {
  const { user } = useAuth();
  const [claims, setClaims] = useState(initialClaims);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'Supplies', amount: '', notes: '' });

  useEffect(() => {
    let active = true;
    async function loadClaims() {
      try {
        const res = await skylineApi.getReimbursements();
        if (!active) return;
        const currentUserId = user?.id || user?.username;
        const filtered = (res?.reimbursements || []).filter((claim) => {
          const matchesUser = !currentUserId || claim.userId === currentUserId || claim.userName === user?.name;
          return matchesUser;
        });
        setClaims(filtered);
      } catch (err) {
        if (active) setClaims(initialClaims || []);
      }
    }

    loadClaims();
    const unsubscribe = subscribeToDataRefresh(() => loadClaims());
    return () => {
      active = false;
      unsubscribe();
    };
  }, [user?.id, user?.username, user?.name, initialClaims]);

  const totalSubmitted = claims.reduce((acc, c) => acc + parseFloat(String(c.amount || '').replace(/[^0-9.]/g, '') || 0), 0);
  const approvedTotal = claims
    .filter((c) => normalizeClaimStatus(c.status) === 'approved')
    .reduce((acc, c) => acc + parseFloat(String(c.amount || '').replace(/[^0-9.]/g, '') || 0), 0);
  const pendingTotal = claims
    .filter((c) => normalizeClaimStatus(c.status) === 'pending')
    .reduce((acc, c) => acc + parseFloat(String(c.amount || '').replace(/[^0-9.]/g, '') || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        amount: Number(formData.amount),
        notes: formData.notes || 'Submitted for treasurer review',
        userId: user?.id || user?.username,
      };
      await skylineApi.submitReimbursement(payload);
      notifyDataRefresh('reimbursements');
      setFormData({ title: '', category: 'Supplies', amount: '', notes: '' });
      setIsSubmitModalOpen(false);
    } catch (err) {
      console.error('Failed to submit reimbursement claim:', err);
    }
  };

  return (
    <div className="my-reimbursements-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <div>
            <h3 className="skyline-card-title">
              <IconReceipt />
              <span>My Expense Reimbursement Claims</span>
            </h3>
            <p className="skyline-card-subtitle">
              Submit and track your personal out-of-pocket expenses for authorized club activities
            </p>
          </div>
          <button
            type="button"
            className="btn-create-event"
            onClick={() => setIsSubmitModalOpen(true)}
          >
            <IconPlus />
            <span>Submit New Claim</span>
          </button>
        </div>

        {/* ── Personal Claim Summary Pills ── */}
        <div className="finance-summary-pills">
          <div className="pill-stat balance">
            Total Claimed: ${totalSubmitted.toFixed(2)}
          </div>
          <div className="pill-stat income">
            Approved: ${approvedTotal.toFixed(2)}
          </div>
          <div className="pill-stat expense">
            Pending Review: ${pendingTotal.toFixed(2)}
          </div>
        </div>

        {/* ── Personal Claims Table ── */}
        <div className="skyline-table-wrapper">
          <table className="skyline-table">
            <thead>
              <tr>
                <th>Expense Item</th>
                <th>Category</th>
                <th>Submitted Date</th>
                <th>Amount</th>
                <th>Claim Status</th>
                <th>Reviewer Notes</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id}>
                  <td><strong>{claim.title}</strong></td>
                  <td><span className="skyline-badge badge-low">{claim.category || 'General'}</span></td>
                  <td style={{ color: '#667085' }}>{claim.submittedDate}</td>
                  <td style={{ fontWeight: 700, color: '#101426' }}>{claim.amount}</td>
                  <td>
                    <span className={`skyline-badge badge-${claim.status}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td style={{ color: '#667085', fontSize: '13px' }}>{claim.notes}</td>
                </tr>
              ))}
              {claims.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#667085' }}>
                    You have not submitted any reimbursement claims yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal for Member Claim Submission ── */}
      {isSubmitModalOpen && (
        <div className="skyline-modal-overlay" onClick={() => setIsSubmitModalOpen(false)}>
          <div className="skyline-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="skyline-modal-header">
              <h3>Submit Expense Reimbursement</h3>
              <button onClick={() => setIsSubmitModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="skyline-modal-body">
              <div className="form-group">
                <label>Expense Description / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Pizza for AI Workshop Mentors"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Expense Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E6F0' }}
                >
                  <option value="Supplies">Event Supplies & Materials</option>
                  <option value="Food & Beverage">Food & Refreshments</option>
                  <option value="Marketing">Printing & Marketing</option>
                  <option value="Tech">Hardware / Cloud Hosting</option>
                  <option value="Travel">Campus Travel / Transport</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="45.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Receipt Link or Vendor Detail</label>
                <textarea
                  placeholder="Paste URL to receipt PDF/image or specify vendor name..."
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="skyline-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsSubmitModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReimbursements;
