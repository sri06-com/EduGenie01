import { Router } from 'express';
import { db } from '../db.js';

export const materialsRouter = Router();

materialsRouter.get('/', (req, res) => {
  const { subject, type, semester, search } = req.query;
  let list = Array.from(db.materials.values());

  if (subject && typeof subject === 'string') {
    list = list.filter((m) => m.subject.toLowerCase() === subject.toLowerCase());
  }

  if (type && typeof type === 'string' && type !== 'All') {
    list = list.filter((m) => m.type.toLowerCase() === type.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.topic.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({ materials: list });
});

materialsRouter.get('/:id', (req, res) => {
  const material = db.materials.get(req.params.id);
  if (!material) {
    return res.status(404).json({ error: 'Material not found' });
  }
  res.json({ material });
});
