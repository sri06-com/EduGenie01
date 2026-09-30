import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  const list = Array.from(db.notifications.values())
    .filter((n) => n.userId === userId || !n.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = list.filter((n) => !n.read).length;
  res.json({ notifications: list, unreadCount });
});

notificationsRouter.patch('/:id/read', authMiddleware, (req: AuthenticatedRequest, res) => {
  const notif = db.notifications.get(req.params.id);
  if (notif) {
    notif.read = true;
    db.notifications.set(notif._id, notif);
  }
  res.json({ success: true });
});

notificationsRouter.patch('/mark-all-read', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  for (const [id, notif] of db.notifications.entries()) {
    if (notif.userId === userId || !notif.userId) {
      notif.read = true;
      db.notifications.set(id, notif);
    }
  }
  res.json({ success: true });
});

notificationsRouter.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  db.notifications.delete(req.params.id);
  res.json({ success: true });
});
