import React, { useState } from 'react';

export function AdminReimbursements({ initialQueue }) {
  const [queue, setQueue] = useState(initialQueue);

  const handleAction = (id, newStatus) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <div className="admin-reimbursements-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Reimbursement Authorization Queue</h3>
          <p className="skyline-card-subtitle">Inspect submitted member receipts and authorize payouts</p>
        </div>
        <div className="skyline-card-body">
          <table className="skyline-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Expense Claim</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Receipt</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.memberName}</strong></td>
                  <td>{item.title}</td>
                  <td>{item.amount}</td>
                  <td>{item.date}</td>
                  <td><a href={item.receiptUrl} className="skyline-link">View Receipt</a></td>
                  <td><span className={`skyline-badge badge-${item.status}`}>{item.status}</span></td>
                  <td>
                    {item.status === 'pending' ? (
                      <div className="table-actions">
                        <button className="btn-table approve" onClick={() => handleAction(item.id, 'approved')}>Approve</button>
                        <button className="btn-table reject" onClick={() => handleAction(item.id, 'rejected')}>Reject</button>
                      </div>
                    ) : (
                      <span className="text-muted">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminReimbursements;
