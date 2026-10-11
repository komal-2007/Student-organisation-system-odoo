import { Router, Request, Response } from 'express';
import { store, AnnouncementRecord } from '../services/store';

const router = Router();

const getAnnouncementAuthorId = (ann: AnnouncementRecord) => {
  if (ann.authorId) return ann.authorId;

  const matchingUser = store.db.users.find(
    (user) => user.name.trim().toLowerCase() === String(ann.author || '').trim().toLowerCase()
  );
  if (matchingUser) return matchingUser.id;

  // Older seed data stored the president's name without a user ID.
  if (ann.id === 'ann-1' && ann.author === 'Komal Bhatia') return 'demo-admin';
  return undefined;
};

// Resolve the current author name so profile renames are reflected.
const resolveAuthorName = (ann: AnnouncementRecord): string => {
  const authorId = getAnnouncementAuthorId(ann);
  const user = authorId ? store.db.users.find((entry) => entry.id === authorId) : undefined;
  if (user) return user.name;
  return typeof ann.author === 'string' ? ann.author : 'Club Admin';
};

// Get Announcements — resolve author name live so profile renames are reflected
router.get('/', (_req: Request, res: Response) => {
  const announcements = store.db.announcements.map((ann) => ({
    ...ann,
    author: resolveAuthorName(ann),
  }));
  return res.json({ announcements });
});

// Create Announcement
router.post('/', (req: Request, res: Response) => {
  const { title, body, category, author, authorId, priority, audience, pinned } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required.' });
  }

  // Resolve authorId from request header if not supplied in body
  const headerUsername = (req.headers['x-user-id'] || req.headers.authorization?.replace('Bearer ', '')) as string | undefined;
  const resolvedUser = headerUsername
    ? store.db.users.find((u) => u.username === headerUsername || u.id === headerUsername)
    : undefined;
  const resolvedAuthorId = authorId || (resolvedUser ? resolvedUser.id : undefined);
  const resolvedAuthorName = resolvedUser && typeof resolvedUser.name === 'string'
    ? resolvedUser.name
    : (author || 'Club Admin');

  const newAnn: Record<string, unknown> = {
    id: `ann-${Date.now()}`,
    title,
    body,
    category: category || 'General',
    author: resolvedAuthorName,
    ...(resolvedAuthorId ? { authorId: resolvedAuthorId } : {}),
    priority: priority || 'Medium',
    audience: audience || 'All Members',
    pinned: Boolean(pinned),
    date: new Date().toISOString().slice(0, 10),
  };

  store.db.announcements.unshift({
    ...newAnn,
    id: String(newAnn.id),
    title: String(newAnn.title),
    body: String(newAnn.body),
    category: String(newAnn.category || 'General'),
    author: String(newAnn.author || 'Club Admin'),
    priority: String(newAnn.priority || 'Medium'),
    audience: String(newAnn.audience || 'All Members'),
    pinned: Boolean(newAnn.pinned),
    date: String(newAnn.date || new Date().toISOString().slice(0, 10)),
    ...(newAnn.authorId ? { authorId: String(newAnn.authorId) } : {}),
  });
  store.commit();

  return res.status(201).json({ announcement: newAnn, message: 'Announcement created successfully.' });
});

export { router as announcementsRouter };
