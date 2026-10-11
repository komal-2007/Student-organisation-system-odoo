import React, { useState, useMemo } from 'react';
import { skylineApi } from '../../../services/api/skylineApi';

/* ==========================================================================
   ADMIN CLUB TREASURY & LEDGER (MOCK)
   Person 2: Replace local state mutations with API calls:
   - GET  /api/admin/finance/summary
   - GET  /api/admin/finance/transactions
   - POST /api/admin/finance/transactions
   - GET  /api/admin/finance/export
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
const IconPlus = () => (
  <Icon size={16}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>
);
const IconX = () => (
  <Icon size={18}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
);
const IconDownload = () => (
  <Icon size={15}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Icon>
);
const IconEye = () => (
  <Icon size={15}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
const IconFilter = () => (
  <Icon size={15}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></Icon>
);

const TABS = [
  { id: 'all', label: 'All Transactions' },
  { id: 'income', label: 'Income Only' },
  { id: 'expense', label: 'Expenses Only' },
];

const CATEGORIES = ['All', 'Sponsorship', 'Event Tech', 'Merchandise', 'Dues', 'Equipment', 'Donation', 'Catering', 'Other'];

const INITIAL_FORM = {
  title: '', type: 'income', amount: '', category: 'Sponsorship', method: 'Bank Wire', notes: '', date: new Date().toISOString().split('T')[0]
};

export function AdminFinance({ financeData }) {
  const [transactions, setTransactions] = useState(financeData?.recentTransactions || []);

  React.useEffect(() => {
    if (financeData?.recentTransactions) {
      setTransactions(financeData.recentTransactions);
    }
  }, [financeData?.recentTransactions]);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [detailTx, setDetailTx] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  /* ── Filtered data ── */
  const filtered = useMemo(() => {
    let list = transactions;
    if (activeTab !== 'all') {
      list = list.filter(t => t.type === activeTab);
    }
    if (selectedCategory !== 'All') {
      list = list.filter(t => t.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.ref && t.ref.toLowerCase().includes(q))
      );
    }
    return list;
  }, [transactions, activeTab, selectedCategory, search]);

  const counts = useMemo(() => ({
    all: transactions.length,
    income: transactions.filter(t => t.type === 'income').length,
    expense: transactions.filter(t => t.type === 'expense').length,
  }), [transactions]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;

    try {
      const res = await skylineApi.addTransaction(form);
      const newTx = res.transaction || {
        ...form,
        id: `tx-${Date.now()}`,
        amount: form.type === 'income' ? `+$${parseFloat(form.amount).toFixed(2)}` : `-$${parseFloat(form.amount).toFixed(2)}`,
        ref: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setTransactions(prev => [newTx, ...prev]);
      flash(`Recorded transaction "${form.title}" on backend treasury ledger!`);
      setShowModal(false);
      setForm(INITIAL_FORM);
    } catch (err) {
      flash(err.message || 'Failed to record transaction.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Method', 'Reference', 'Notes'];
    const rows = transactions.map(t => [
      t.date || '',
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.type || '',
      t.category || '',
      t.amount || '',
      t.method || '',
      t.ref || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skyline-treasury-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    flash(`Exported ${transactions.length} transactions to CSV`);
  };

  return (
    <div className="admin-finance-section">
      {/* Toast Notification */}
      {successMsg && <div className="admin-events-toast">{successMsg}</div>}

      {/* Summary Header Cards */}
      <div className="skyline-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 className="skyline-card-title">Club Treasury & Ledger</h3>
            <p className="skyline-card-subtitle" style={{ margin: 0 }}>Restricted financial administration and expense management</p>
          </div>
          <button className="btn-table" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={handleExportCSV}>
            <IconDownload /> Export CSV
          </button>
        </div>

        <div className="finance-summary-pills" style={{ marginBottom: 0 }}>
          <div className="pill-stat income">Income: {financeData.totalIncome}</div>
          <div className="pill-stat expense">Expenses: {financeData.totalExpenses}</div>
          <div className="pill-stat balance">Net Treasury: {financeData.netBalance}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-events-toolbar">
        <div className="admin-events-tabs">
          {TABS.map(tab => (
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
          {/* Category Filter Dropdown */}
          <div className="admin-events-search" style={{ minWidth: 150 }}>
            <IconFilter />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%', cursor: 'pointer' }}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div className="admin-events-search">
            <IconSearch />
            <input
              type="text"
              placeholder="Search ref, title, category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className="btn-create-event" onClick={() => setShowModal(true)}>
            <IconPlus /> Add Entry
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="skyline-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="admin-events-empty">
            <IconSearch />
            <p className="admin-events-empty-title">No transactions found</p>
            <p className="admin-events-empty-sub">No ledger records match the selected parameters.</p>
          </div>
        ) : (
          <div className="skyline-table-wrapper">
            <table className="skyline-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id}>
                    <td><span style={{ fontSize: 12, fontFamily: 'monospace', color: '#667085' }}>{tx.ref || tx.id}</span></td>
                    <td className="admin-events-date-cell">{tx.date}</td>
                    <td><strong>{tx.title}</strong></td>
                    <td><span className="admin-events-category-chip">{tx.category}</span></td>
                    <td style={{ fontSize: 12.5, color: '#667085' }}>{tx.method || 'Standard'}</td>
                    <td>
                      <span className={`skyline-badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={tx.type === 'income' ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>
                      {tx.amount}
                    </td>
                    <td>
                      <button className="btn-table" title="View entry" onClick={() => setDetailTx(tx)}>
                        <IconEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Transaction Modal */}
      {showModal && (
        <div className="admin-events-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-events-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">Record Treasury Transaction</h3>
              <button className="admin-events-modal-close" onClick={() => setShowModal(false)}><IconX /></button>
            </div>

            <form onSubmit={handleAddTransaction} className="admin-events-form">
              <div className="form-field">
                <label>Transaction Title <span className="req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Annual Robot Build Sponsor"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Transaction Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="income">Income (+ Credit)</option>
                    <option value="expense">Expense (- Debit)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Amount ($ USD) <span className="req">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Payment Method</label>
                  <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
                    <option value="Bank Wire">Bank Wire</option>
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Stripe Online">Stripe Online</option>
                    <option value="Check Deposit">Check Deposit</option>
                    <option value="Reimbursement Payout">Reimbursement Payout</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Transaction Notes / Context</label>
                <textarea
                  rows="3"
                  placeholder="Add vendor, invoice number, or authorization note..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="admin-events-modal-actions">
                <button type="button" className="btn-table" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-create-event">Record Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {detailTx && (
        <div className="admin-events-overlay" onClick={() => setDetailTx(null)}>
          <div className="admin-events-modal admin-events-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-events-modal-header">
              <h3 className="admin-events-modal-title">Transaction Details</h3>
              <button className="admin-events-modal-close" onClick={() => setDetailTx(null)}><IconX /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13.5, marginBottom: 16 }}>
              <div><strong>Ref ID:</strong> {detailTx.ref || detailTx.id}</div>
              <div><strong>Date:</strong> {detailTx.date}</div>
              <div><strong>Category:</strong> {detailTx.category}</div>
              <div><strong>Method:</strong> {detailTx.method || 'N/A'}</div>
              <div><strong>Type:</strong> <span className={`skyline-badge ${detailTx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{detailTx.type}</span></div>
              <div><strong>Amount:</strong> <span className={detailTx.type === 'income' ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>{detailTx.amount}</span></div>
            </div>

            {detailTx.notes && (
              <div className="admin-events-drawer-desc">
                <strong>Notes:</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#101426' }}>{detailTx.notes}</p>
              </div>
            )}

            <div className="admin-events-modal-actions">
              <button className="btn-table" onClick={() => setDetailTx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFinance;
