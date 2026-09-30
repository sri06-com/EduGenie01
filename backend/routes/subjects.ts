import { Router } from 'express';
import { db } from '../db.js';

export const subjectsRouter = Router();

subjectsRouter.get('/', (_req, res) => {
  const subjects = Array.from(db.subjects.values());
  res.json({ subjects });
});

subjectsRouter.get('/:id', (req, res) => {
  const subject = db.subjects.get(req.params.id);
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }
  res.json({ subject });
});
