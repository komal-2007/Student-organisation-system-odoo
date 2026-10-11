import React, { useState, useMemo, useEffect } from 'react';
import { skylineApi, notifyDataRefresh } from '../../../services/api/skylineApi';

/* ==========================================================================
   ADMIN REIMBURSEMENTS QUEUE — Authorization & Review (MOCK)
   Person 2: Replace local state mutations with API calls:
   - GET  /api/admin/reimbursements
   - PUT  /api/admin/reimbursements/:id/approve
   - PUT  /api/admin/reimbursements/:id/reject
   ========================================================================== */

/* ── Inline SVG Icons ── */
const Icon = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IconSearch = () => (
  <Icon size={16}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);
const IconX = () => (
  <Icon size={18}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);
const IconFileText = () => (
  <Icon size={15}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </Icon>
);
const IconCheck = () => (
  <Icon size={15}><polyline points="20,6 9,17 4,12" /></Icon>
);
const IconBan = () => (
  <Icon size={15}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </Icon>
);

const STATUS_TABS = [
  { id: 'all', label: 'All Claims' },
  { id: 'pending', label: 'Pending Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const normalizeStatus = (status) => {
  const value = String(status || '').trim();
  if (!value) return 'Pending Approval';
  if (['pending', 'Pending', 'Pending Approval'].includes(value)) return 'Pending Approval';
  if (['approved', 'Approved'].includes(value)) return 'Approved';
  if (['rejected', 'Rejected'].includes(value)) return 'Rejected';
  return value;
};

const badgeClass = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'Approved') return 'skyline-badge badge-approved';
  if (normalized === 'Pending Approval') return 'skyline-badge badge-pending';
  return 'skyline-badge badge-rejected';
};

export function AdminReimbursements({ initialQueue }) {
  const [queue, setQueue] = useState(initialQueue || []);

  useEffect(() => {
    setQueue(initialQueue || []);
  }, [initialQueue]);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const [inspectClaim, setInspectClaim] = useState(null);
  const [rejectClaimTarget, setRejectClaimTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  /* ── Filtered data ── */
  const filtered = useMemo(() => {
    let list = queue;
    if (activeTab !== 'all') {
      list = list.filter(item => normalizeStatus(item.status) === {
        pending: 'Pending Approval',
        approved: 'Approved',
        rejected: 'Rejected',
      }[activeTab]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(item =>
        (item.memberName || '').toLowerCase().includes(q) ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.department && item.department.toLowerCase().includes(q))
      );
    }
    return list;
  }, [queue, activeTab, search]);

  const counts = useMemo(() => ({
    all: queue.length,
    pending: queue.filter(q => normalizeStatus(q.status) === 'Pending Approval').length,
    approved: queue.filter(q => normalizeStatus(q.status) === 'Approved').length,
    rejected: queue.filter(q => normalizeStatus(q.status) === 'Rejected').length,
  }), [queue]);

  const totals = useMemo(() => {
    const parse = (str) => parseFloat(String(str || '').replace(/[^0-9.]/g, '')) || 0;
    const pendingVal = queue.filter(q => normalizeStatus(q.status) === 'Pending Approval').reduce((sum, q) => sum + parse(q.amount), 0);
    const approvedVal = queue.filter(q => normalizeStatus(q.status) === 'Approved').reduce((sum, q) => sum + parse(q.amount), 0);
    return {
      pending: `$${pendingVal.toFixed(2)}`,
      approved: `$${approvedVal.toFixed(2)}`,
    };
  }, [queue]);

  /* ── Actions ── */
  const handleApprove = async (id) => {
    const target = queue.find(q => q.id === id);
    try {
      await skylineApi.updateReimbursementStatus(id, 'Approved');
      setQueue(prev => prev.map(item => item.id === id ? { ...item, status: 'Approved' } : item));
      notifyDataRefresh('reimbursements');
      flash(`Approved claim '${target?.title}' for ${target?.amount}.`);
      if (inspectClaim?.id === id) setInspectClaim(null);
    } catch (err) {
      flash(err.message || 'Failed to approve claim.');
    }
  };

  const handleOpenRejectModal = (claim) => {
    setRejectClaimTarget(claim);
    setRejectReason('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectClaimTarget) return;
    try {
      await skylineApi.updateReimbursementStatus(rejectClaimTarget.id, 'Rejected');
      setQueue(prev => prev.map(item =>
        item.id === rejectClaimTarget.id ? { ...item, status: 'Rejected', rejectReason: rejectReason || 'No reason provided' } : item
      ));
      notifyDataRefresh('reimbursements');
      flash(`Rejected claim '${rejectClaimTarget.title}'.`);
    } catch (err) {
      flash(err.message || 'Failed to reject claim.');
    } finally {
      setRejectClaimTarget(null);
      if (inspectClaim?.id === rejectClaimTarget.id) setInspectClaim(null);
    }
  };

  return (
    <div className="admin-reimbursements-section">
      {/* Toast Notification */}
      {successMsg && <div className="admin-events-toast">{successMsg}</div>}

      {/* Financial Summary Pills */}
      <div className="finance-summary-pills">
        <div className="pill-stat expense">Pending Authorization: {totals.pending} ({counts.pending} claims)</div>
        <div className="pill-stat income">Total Authorized Payouts: {totals.approved} ({counts.approved} claims)</div>
      </div>

      {/* Toolbar */}
      <div className="admin-events-toolbar">
        <div className="admin-events-tabs">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-events-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="tab-count">{counts[tab.id]}</span>
            </button>
          ))}
        </div>

        <div className="admin-events-toolbar-right">
          <div className="admin-events-search">
            <IconSearch />
            <input
              type="text"
              placeholder="Search member, claim, category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="skyline-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="admin-events-empty">
            <IconSearch />
            <p className="admin-events-empty-title">No reimbursement claims found</p>
            <p className="admin-events-empty-sub">No expense submissions match the current tab or query.</p>
          </div>
        ) : (
          <div className="skyline-table-wrapper">
            <table className="skyline-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Expense Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Receipt</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong className="admin-events-title-cell">{item.memberName}</strong>
                      <div className="admin-events-organizer">{item.department} Dept</div>
                    </td>
                    <td><strong>{item.title}</strong></td>
                    <td><span className="admin-events-category-chip">{item.category}</span></td>
                    <td className="text-danger"><strong>{item.amount}</strong></td>
                    <td className="admin-events-date-cell">{item.date}</td>
                    <td>
                      <button
                        className="btn-table"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => setInspectClaim(item)}
                      >
                        <IconFileText /> Inspect
                      </button>
                    </td>
                    <td><span className={badgeClass(item.status)}>{normalizeStatus(item.status)}</span></td>
                    <td>
                      {normalizeStatus(item.status) === 'Pending Approval' ? (
                        <div className="table-actions" style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn-table approve" onClick={() => handleApprove(item.id)}>
                            Approve
                          </button>
                          <button className="btn-table reject" onClick={() => handleOpenRejectModal(item)}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted" style={{ fontSize: 12.5 }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Inspection Modal */}
      {inspectClaim && (
        <div className="admin-events-overlay" onClick={() => setInspectClaim(null)}>
          <div className="admin-events-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">Receipt & Claim Details</h3>
              <button className="admin-events-modal-close" onClick={() => setInspectClaim(null)}><IconX /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16, fontSize: 13.5 }}>
              <div><strong>Claimant:</strong> {inspectClaim.memberName} ({inspectClaim.department})</div>
              <div><strong>Date:</strong> {inspectClaim.date}</div>
              <div><strong>Category:</strong> {inspectClaim.category}</div>
              <div><strong>Total Amount:</strong> <span style={{ color: '#DC2626', fontWeight: 700 }}>{inspectClaim.amount}</span></div>
            </div>

            <div className="admin-events-drawer-desc">
              <strong>Expense Description:</strong>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#101426' }}>{inspectClaim.notes}</p>
            </div>

            {/* Mock Receipt Document Visual */}
            <div style={{
              background: '#F9FAFB', border: '2px dashed #E2E6F0', borderRadius: 10,
              padding: 24, textTransform: 'uppercase', textAlign: 'center', margin: '16px 0',
              color: '#667085', fontSize: 12, letterSpacing: '0.05em'
            }}>
              <IconFileText size={32} />
              <div style={{ marginTop: 8, fontWeight: 700, color: '#101426' }}>MOCK RECEIPT DOCUMENT</div>
              <div>File: {inspectClaim.id}_receipt_scan.pdf</div>
              <div style={{ fontSize: 11, color: '#A7B0CC', marginTop: 4 }}>[Verified Digital Timestamp Attached]</div>
            </div>

            <div className="admin-events-modal-actions">
              {normalizeStatus(inspectClaim.status) === 'Pending Approval' ? (
                <>
                  <button className="btn-table reject" onClick={() => { handleOpenRejectModal(inspectClaim); }}>Reject Claim</button>
                  <button className="btn-create-event" style={{ background: '#059669' }} onClick={() => handleApprove(inspectClaim.id)}>Approve & Payout</button>
                </>
              ) : (
                <button className="btn-table" onClick={() => setInspectClaim(null)}>Close Inspection</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectClaimTarget && (
        <div className="admin-events-overlay" onClick={() => setRejectClaimTarget(null)}>
          <div className="admin-events-modal admin-events-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title" style={{ color: '#DC2626' }}>Reject Claim</h3>
              <button className="admin-events-modal-close" onClick={() => setRejectClaimTarget(null)}><IconX /></button>
            </div>

            <form onSubmit={handleConfirmReject} className="admin-events-form">
              <p style={{ fontSize: 13.5, color: '#667085', margin: '0 0 10px' }}>
                Please specify a reason for declining <strong>{rejectClaimTarget.memberName}'s</strong> claim for {rejectClaimTarget.amount}.
              </p>

              <div className="form-field">
                <label>Reason for Rejection</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Missing valid itemized tax invoice..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div className="admin-events-modal-actions">
                <button type="button" className="btn-table" onClick={() => setRejectClaimTarget(null)}>Cancel</button>
                <button type="submit" className="btn-table reject">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReimbursements;
