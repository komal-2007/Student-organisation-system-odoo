import React, { useState } from 'react';

/**
 * MEMBER REIMBURSEMENTS VIEW
 * Strictly shows ONLY the logged-in member's submitted claims and status.
 * Contains ZERO club-wide financial ledgers or admin approval controls.
 */
export function MyReimbursements({ initialClaims }) {
  const [claims, setClaims] = useState(initialClaims);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', notes: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newClaim = {
      id: `my-rmb-${Date.now()}`,
      title: formData.title,
      amount: `$${Number(formData.amount).toFixed(2)}`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: formData.notes || 'Submitted for review',
    };
    setClaims((prev) => [newClaim, ...prev]);
    setFormData({ title: '', amount: '', notes: '' });
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="my-reimbursements-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <div>
            <h3 className="skyline-card-title">My Reimbursement Claims</h3>
            <p className="skyline-card-subtitle">Track the status of your submitted expense reimbursements</p>
          </div>
          <button className="btn-primary-small" onClick={() => setIsSubmitModalOpen(true)}>
            + Submit New Expense Claim
          </button>
        </div>
        <div className="skyline-card-body">
          <table className="skyline-table">
            <thead>
              <tr>
                <th>Expense Item</th>
                <th>Submitted Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id}>
                  <td><strong>{claim.title}</strong></td>
                  <td>{claim.submittedDate}</td>
                  <td>{claim.amount}</td>
                  <td><span className={`skyline-badge badge-${claim.status}`}>{claim.status}</span></td>
                  <td className="text-secondary">{claim.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Member Claim Submission */}
      {isSubmitModalOpen && (
        <div className="skyline-modal-overlay" onClick={() => setIsSubmitModalOpen(false)}>
          <div className="skyline-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="skyline-modal-header">
              <h3>Submit Expense Reimbursement Claim</h3>
              <button onClick={() => setIsSubmitModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="skyline-modal-body">
              <div className="form-group">
                <label>Expense Description / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Refreshments for Workshop"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
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
                <label>Notes & Receipt Link</label>
                <textarea
                  placeholder="Receipt URL or additional context..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="skyline-modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsSubmitModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReimbursements;
