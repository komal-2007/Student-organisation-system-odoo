import { Router, Request, Response } from 'express';
import { store } from '../services/store';

const router = Router();

// Login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = store.db.users.find((u) => u.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Username or password is incorrect.' });
  }

  const { password: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// Session
router.get('/session', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const username = authHeader ? authHeader.replace('Bearer ', '').trim() : undefined;
  
  if (!username) {
    return res.status(401).json({ error: 'No active session.' });
  }

  const user = store.db.users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Session user not found.' });
  }

  const { password: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// Logout
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

export { router as authRouter };
