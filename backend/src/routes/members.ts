import { Router, Request, Response } from 'express';
import { store } from '../services/store';

const router = Router();

const isProtectedAdminUser = (user: { id?: string; role?: string }) => {
  const role = String(user?.role || '').toLowerCase();
  return user?.id === 'demo-admin' || role.includes('admin') || role.includes('president');
};

// Get Members Directory
router.get('/', (_req: Request, res: Response) => {
  const members = store.db.users.map(({ password: _, ...u }) => u);
  return res.json({ members });
});

// Update Member Role / Department
router.put('/:id/role', (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, department } = req.body;

  const userIndex = store.db.users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  if (isProtectedAdminUser(store.db.users[userIndex])) {
    return res.status(403).json({ error: 'President / Admin role cannot be modified.' });
  }

  if (role) store.db.users[userIndex].role = role;
  if (department) store.db.users[userIndex].department = department;

  store.commit();

  const { password: _, ...safeUser } = store.db.users[userIndex];
  return res.json({ member: safeUser, message: 'Member role updated successfully.' });
});

// Approve / Reject / Update Status
router.put('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const userIndex = store.db.users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  if (isProtectedAdminUser(store.db.users[userIndex])) {
    return res.status(403).json({ error: 'Admin accounts cannot be updated by member approval actions.' });
  }

  store.db.users[userIndex].status = status;
  store.commit();

  const { password: _, ...safeUser } = store.db.users[userIndex];
  return res.json({ member: safeUser, message: `Member status updated to ${status}.` });
});

// Add New Member — with email + username uniqueness guard
router.post('/', (req: Request, res: Response) => {
  const { name, email, username, password, role, department, title, studentId, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  // Normalise email for comparison
  const normalizedEmail = String(email).trim().toLowerCase();

  // Enforce email uniqueness
  const emailExists = store.db.users.some(
    (u) => String(u.email || '').trim().toLowerCase() === normalizedEmail
  );
  if (emailExists) {
    return res.status(409).json({ error: `A member with email '${email}' already exists.` });
  }

  // Enforce username uniqueness if provided
  if (username) {
    const usernameExists = store.db.users.some(
      (u) => String(u.username || '').trim().toLowerCase() === String(username).trim().toLowerCase()
    );
    if (usernameExists) {
      return res.status(409).json({ error: `Username '${username}' is already taken.` });
    }
  }

  const newMember: Record<string, unknown> = {
    id: `mem-${Date.now()}`,
    username: username || `user_${Date.now()}`,
    password: password || 'changeme',
    name: name.trim(),
    email: normalizedEmail,
    role: role || 'member',
    department: department || '',
    title: title || '',
    studentId: studentId || '',
    status: status || 'Active',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  };

  store.db.users.push({
    ...newMember,
    id: String(newMember.id),
    username: String(newMember.username),
    password: String(newMember.password),
    name: String(newMember.name),
    email: String(newMember.email),
    role: (newMember.role as 'admin' | 'member' | 'core_member') || 'member',
    department: typeof newMember.department === 'string' ? newMember.department : '',
    title: typeof newMember.title === 'string' ? newMember.title : '',
    studentId: typeof newMember.studentId === 'string' ? newMember.studentId : '',
    status: String(newMember.status || 'Active'),
    joinedDate: String(newMember.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
  });
  store.commit();

  const { password: _, ...safeUser } = newMember as { password: string; [key: string]: unknown };
  return res.status(201).json({ member: safeUser, message: 'Member added successfully.' });
});

// Remove / Delete Member
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const userIndex = store.db.users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  if (isProtectedAdminUser(store.db.users[userIndex])) {
    return res.status(403).json({ error: 'President / Admin cannot be removed.' });
  }

  const removed = store.db.users.splice(userIndex, 1);
  store.commit();

  return res.json({ success: true, message: `Removed member ${removed[0].name}.` });
});

export { router as membersRouter };
