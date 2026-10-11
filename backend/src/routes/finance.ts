import { Router, Request, Response } from 'express';
import { store } from '../services/store';

const router = Router();

// Finance Summary & Transactions
router.get('/summary', (_req: Request, res: Response) => {
  const transactions = store.db.transactions;
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') totalIncome += tx.rawAmount;
    if (tx.type === 'expense') totalExpenses += tx.rawAmount;
  }

  const netBalance = totalIncome - totalExpenses;

  return res.json({
    totalIncome: `$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    totalExpenses: `$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    netBalance: `$${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    recentTransactions: transactions,
  });
});

// Add Ledger Transaction
router.post('/transactions', (req: Request, res: Response) => {
  const { title, type, amount, category, method, notes, date } = req.body;

  if (!title || !amount) {
    return res.status(400).json({ error: 'Title and amount are required.' });
  }

  const numAmount = parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;
  const formattedAmount = type === 'income' ? `+$${numAmount.toFixed(2)}` : `-$${numAmount.toFixed(2)}`;

  const newTx = {
    id: `tx-${Date.now()}`,
    title,
    type: type || 'expense',
    amount: formattedAmount,
    rawAmount: numAmount,
    category: category || 'General',
    method: method || 'Bank Wire',
    ref: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: notes || '',
    date: date || new Date().toISOString().slice(0, 10),
  };

  store.db.transactions.unshift(newTx);
  store.commit();

  return res.status(201).json({ transaction: newTx, message: 'Transaction recorded successfully.' });
});

// Export CSV
router.get('/export', (_req: Request, res: Response) => {
  const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Method', 'Reference', 'Notes'];
  const rows = store.db.transactions.map((t) => [
    t.date || '',
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.type || '',
    t.category || '',
    t.amount || '',
    t.method || '',
    t.ref || '',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="skyline-treasury-ledger.csv"');
  return res.send(csv);
});

// Reimbursements list
router.get('/reimbursements', (_req: Request, res: Response) => {
  return res.json({ reimbursements: store.db.reimbursements });
});

// Submit Reimbursement
router.post('/reimbursements', (req: Request, res: Response) => {
  const { title, amount, category, notes, userId } = req.body;
  if (!title || !amount) {
    return res.status(400).json({ error: 'Title and amount are required.' });
  }

  const numAmount = parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;
  const user = store.db.users.find((u) => u.id === userId || u.username === userId) || store.db.users[1];

  const newClaim = {
    id: `rmb-${Date.now()}`,
    claimNumber: `CLM-${Math.floor(100 + Math.random() * 900)}`,
    userId: user.id,
    userName: user.name,
    title,
    amount: `$${numAmount.toFixed(2)}`,
    rawAmount: numAmount,
    category: category || 'General',
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending Approval' as const,
    notes: notes || '',
  };

  store.db.reimbursements.unshift(newClaim);
  store.commit();

  return res.status(201).json({ claim: newClaim, message: 'Reimbursement claim submitted.' });
});

// Approve / Reject Reimbursement
router.put('/reimbursements/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const claimIndex = store.db.reimbursements.findIndex((c) => c.id === id);
  if (claimIndex === -1) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  store.db.reimbursements[claimIndex].status = status;
  store.commit();

  return res.json({ claim: store.db.reimbursements[claimIndex], message: `Claim status updated to ${status}.` });
});

export { router as financeRouter };
