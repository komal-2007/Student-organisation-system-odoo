import React from 'react';

export function AdminFinance({ financeData }) {
  return (
    <div className="admin-finance-section">
      <div className="skyline-card">
        <div className="skyline-card-header">
          <h3 className="skyline-card-title">Club Treasury & Ledger</h3>
          <p className="skyline-card-subtitle">Restricted financial administration and expense management</p>
        </div>
        <div className="skyline-card-body">
          <div className="finance-summary-pills">
            <div className="pill-stat income">Income: {financeData.totalIncome}</div>
            <div className="pill-stat expense">Expenses: {financeData.totalExpenses}</div>
            <div className="pill-stat balance">Net Treasury: {financeData.netBalance}</div>
          </div>
          <table className="skyline-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {financeData.recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td><strong>{tx.title}</strong></td>
                  <td>{tx.category}</td>
                  <td><span className={`badge-${tx.type}`}>{tx.type}</span></td>
                  <td className={tx.type === 'income' ? 'text-success' : 'text-danger'}>{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminFinance;
