import { Router } from 'express';
import { db, Note } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';

export const notesRouter = Router();

// Get user notes
notesRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  const userNotes = Array.from(db.notes.values())
    .filter((n) => n.userId === userId || !n.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ notes: userNotes });
});

// Create note
notesRouter.post('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id || 'user_demo_101';
  const { title, subject, topic, lengthType, content } = req.body;

  if (!title || !subject || !content) {
    return res.status(400).json({ error: 'Title, subject, and content are required' });
  }

  const noteId = 'note_' + Date.now();
  const newNote: Note = {
    _id: noteId,
    userId,
    title,
    subject,
    topic: topic || title,
    lengthType: lengthType || 'Detailed',
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.notes.set(noteId, newNote);

  // Gamification: Give user 30 XP
  let badgeUnlocked = false;
  let unlockedBadgeName = '';
  if (req.user) {
    req.user.xp += 30;
    // Check level up (e.g. 500 XP per level)
    req.user.level = Math.floor(req.user.xp / 400) + 1;

    // Check Note Crafter badge
    const userNotesCount = Array.from(db.notes.values()).filter((n) => n.userId === req.user?._id).length;
    let userBadges = db.userBadges.get(req.user._id);
    if (!userBadges) {
      userBadges = new Set();
      db.userBadges.set(req.user._id, userBadges);
    }

    if (userNotesCount >= 3 && !userBadges.has('note_crafter')) {
      userBadges.add('note_crafter');
      badgeUnlocked = true;
      unlockedBadgeName = 'Note Crafter';
      // Add notification
      const notifId = 'notif_' + Date.now();
      db.notifications.set(notifId, {
        _id: notifId,
        userId: req.user._id,
        title: '🏆 Achievement Unlocked: Note Crafter!',
        message: 'You have generated and organized valuable study notes on EduGenie!',
        type: 'achievement',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/notes',
      });
    }
  }

  res.status(201).json({
    message: 'Note saved successfully',
    note: newNote,
    xpEarned: 30,
    badgeUnlocked,
    unlockedBadgeName,
  });
});

// Update note
notesRouter.put('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const note = db.notes.get(req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const { title, subject, topic, content } = req.body;
  if (title) note.title = title;
  if (subject) note.subject = subject;
  if (topic) note.topic = topic;
  if (content) note.content = content;
  note.updatedAt = new Date().toISOString();

  db.notes.set(note._id, note);
  res.json({ message: 'Note updated successfully', note });
});

// Delete note
notesRouter.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const note = db.notes.get(req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  db.notes.delete(req.params.id);
  res.json({ message: 'Note deleted successfully' });
});
