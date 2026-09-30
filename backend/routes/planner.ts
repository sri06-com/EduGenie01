import { Router } from 'express';
import { db, StudyPlan } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';

export const plannerRouter = Router();

// Get tasks
plannerRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  const plans = Array.from(db.studyPlans.values())
    .filter((p) => p.userId === userId || !p.userId)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  res.json({ plans });
});

// Add task
plannerRouter.post('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id || 'user_demo_101';
  const { subject, topic, date, time, duration, priority } = req.body;

  if (!subject || !topic || !date) {
    return res.status(400).json({ error: 'Subject, topic, and date are required' });
  }

  const planId = 'plan_' + Date.now();
  const newPlan: StudyPlan = {
    _id: planId,
    userId,
    subject,
    topic,
    date,
    time: time || '12:00',
    duration: Number(duration) || 45,
    priority: priority || 'Medium',
    completed: false,
    createdAt: new Date().toISOString(),
  };

  db.studyPlans.set(planId, newPlan);

  res.status(201).json({
    message: 'Study task scheduled successfully',
    plan: newPlan,
  });
});

// Toggle task completion
plannerRouter.patch('/:id/toggle', authMiddleware, (req: AuthenticatedRequest, res) => {
  const plan = db.studyPlans.get(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Task not found' });
  }

  plan.completed = !plan.completed;
  db.studyPlans.set(plan._id, plan);

  let xpEarned = 0;
  let badgeUnlocked = false;

  if (plan.completed && req.user) {
    xpEarned = 25;
    req.user.xp += xpEarned;
    req.user.level = Math.floor(req.user.xp / 400) + 1;

    // Check Study Master badge
    const userPlans = Array.from(db.studyPlans.values()).filter(
      (p) => p.userId === req.user?._id && p.completed
    );
    let userBadges = db.userBadges.get(req.user._id);
    if (!userBadges) {
      userBadges = new Set();
      db.userBadges.set(req.user._id, userBadges);
    }

    if (userPlans.length >= 5 && !userBadges.has('study_master')) {
      userBadges.add('study_master');
      badgeUnlocked = true;
      const notifId = 'notif_' + Date.now();
      db.notifications.set(notifId, {
        _id: notifId,
        userId: req.user._id,
        title: '🏆 Achievement Unlocked: Study Master!',
        message: 'You have conquered 5+ scheduled study goals on your planner!',
        type: 'achievement',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/planner',
      });
    }
  }

  res.json({
    message: plan.completed ? 'Goal completed! Great job! 🎉' : 'Marked as pending',
    plan,
    xpEarned,
    badgeUnlocked,
  });
});

// Delete task
plannerRouter.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const plan = db.studyPlans.get(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Task not found' });
  }

  db.studyPlans.delete(req.params.id);
  res.json({ message: 'Study task removed successfully' });
});
