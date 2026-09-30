import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { authRouter } from './backend/routes/auth.js';
import { subjectsRouter } from './backend/routes/subjects.js';
import { materialsRouter } from './backend/routes/materials.js';
import { notesRouter } from './backend/routes/notes.js';
import { quizzesRouter } from './backend/routes/quizzes.js';
import { plannerRouter } from './backend/routes/planner.js';
import { progressRouter } from './backend/routes/progress.js';
import { notificationsRouter } from './backend/routes/notifications.js';
import { aiRouter } from './backend/routes/ai.js';
import { db } from './backend/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/subjects', subjectsRouter);
  app.use('/api/materials', materialsRouter);
  app.use('/api/notes', notesRouter);
  app.use('/api/quizzes', quizzesRouter);
  app.use('/api/planner', plannerRouter);
  app.use('/api/progress', progressRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/ai', aiRouter);

  // Global Search API
  app.get('/api/search', (req, res) => {
    const q = (req.query.q as string || '').toLowerCase().trim();
    if (!q) {
      return res.json({ subjects: [], materials: [], notes: [], quizzes: [] });
    }

    const subjects = Array.from(db.subjects.values()).filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );

    const materials = Array.from(db.materials.values()).filter(
      (m) => m.title.toLowerCase().includes(q) || m.topic.toLowerCase().includes(q) || m.tags.some((t) => t.toLowerCase().includes(q))
    );

    const notes = Array.from(db.notes.values()).filter(
      (n) => n.title.toLowerCase().includes(q) || n.topic.toLowerCase().includes(q) || n.subject.toLowerCase().includes(q)
    );

    const quizzes = Array.from(db.quizzes.values()).filter(
      (qz) => qz.title.toLowerCase().includes(q) || qz.topic.toLowerCase().includes(q) || qz.subject.toLowerCase().includes(q)
    );

    res.json({ subjects, materials, notes, quizzes });
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EduGenie server:', err);
  process.exit(1);
});
