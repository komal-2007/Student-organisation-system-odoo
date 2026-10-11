import { Router, Request, Response } from 'express';
import { store } from '../services/store';

const router = Router();

// Get Profile
router.get('/profile', (req: Request, res: Response) => {
  const username = req.headers['x-user-id'] || req.headers.authorization?.replace('Bearer ', '');
  const user = store.db.users.find((u) => u.username === username || u.id === username);

  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  const { password: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// Update Profile
router.put('/profile', (req: Request, res: Response) => {
  const username = req.headers['x-user-id'] || req.headers.authorization?.replace('Bearer ', '');
  const userIndex = store.db.users.findIndex((u) => u.username === username || u.id === username);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { name, email, department, title } = req.body;
  if (name) store.db.users[userIndex].name = name;
  if (email) store.db.users[userIndex].email = email;
  if (department !== undefined) store.db.users[userIndex].department = department;
  if (title !== undefined) store.db.users[userIndex].title = title;

  store.commit();

  const { password: _, ...safeUser } = store.db.users[userIndex];
  return res.json({ user: safeUser, message: 'Profile updated successfully.' });
});

// Update Password
router.post('/password', (req: Request, res: Response) => {
  const username = req.headers['x-user-id'] || req.headers.authorization?.replace('Bearer ', '');
  const userIndex = store.db.users.findIndex((u) => u.username === username || u.id === username);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { currentPassword, newPassword } = req.body;
  if (store.db.users[userIndex].password !== currentPassword) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  store.db.users[userIndex].password = newPassword;
  store.commit();

  return res.json({ success: true, message: 'Password updated successfully.' });
});

export { router as userRouter };
