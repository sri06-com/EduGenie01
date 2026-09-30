import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';

export const progressRouter = Router();

progressRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id || 'user_demo_101';

  // Calculate subject performance
  const subjects = Array.from(db.subjects.values());
  const userResults = Array.from(db.quizResults.values()).filter((r) => r.userId === userId);
  const userPlans = Array.from(db.studyPlans.values()).filter((p) => p.userId === userId);
  const userNotes = Array.from(db.notes.values()).filter((n) => n.userId === userId);

  // Subject breakdowns
  const subjectProgress = subjects.map((sub) => {
    const subQuizzes = userResults.filter((r) => r.subject.toLowerCase() === sub.name.toLowerCase());
    const avgScore = subQuizzes.length > 0
      ? Math.round(subQuizzes.reduce((acc, curr) => acc + curr.percentage, 0) / subQuizzes.length)
      : Math.round((sub.completedTopics / sub.totalTopics) * 85);

    const completionRate = Math.round((sub.completedTopics / sub.totalTopics) * 100);
    const overallSubScore = Math.round(completionRate * 0.5 + avgScore * 0.5);

    return {
      _id: sub._id,
      name: sub.name,
      code: sub.code,
      color: sub.color,
      icon: sub.icon,
      completedTopics: sub.completedTopics,
      totalTopics: sub.totalTopics,
      percentage: Math.min(100, overallSubScore),
      quizAverage: avgScore,
    };
  });

  // Calculate overall progress across subjects
  const overallProgress = Math.round(
    subjectProgress.reduce((sum, s) => sum + s.percentage, 0) / (subjectProgress.length || 1)
  );

  // Study logs
  const studyLogs = db.userStudyLogs.get(userId) || [
    { date: 'Mon', minutes: 45 },
    { date: 'Tue', minutes: 60 },
    { date: 'Wed', minutes: 90 },
    { date: 'Thu', minutes: 75 },
    { date: 'Fri', minutes: 120 },
    { date: 'Sat', minutes: 50 },
    { date: 'Sun', minutes: 85 },
  ];

  const totalStudyMinutes = studyLogs.reduce((acc, curr) => acc + curr.minutes, 0);

  // Stats summary
  const stats = {
    overallProgress,
    totalStudyHours: (totalStudyMinutes / 60).toFixed(1),
    totalStudyMinutes,
    totalQuizzesTaken: userResults.length,
    averageQuizScore: userResults.length > 0
      ? Math.round(userResults.reduce((a, b) => a + b.percentage, 0) / userResults.length)
      : 80,
    totalTasksCompleted: userPlans.filter((p) => p.completed).length,
    totalNotesCreated: userNotes.length,
    streak: req.user?.streak || 7,
    xp: req.user?.xp || 1250,
    level: req.user?.level || 4,
  };

  res.json({
    stats,
    subjects: subjectProgress,
    weeklyStudyLogs: studyLogs,
    recentQuizResults: userResults.slice(-5),
  });
});

// Log a study session (e.g. from Pomodoro timer)
progressRouter.post('/log-session', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id || 'user_demo_101';
  const { minutes, subject } = req.body;

  const sessionMins = Number(minutes) || 25;
  const today = new Date().toISOString().split('T')[0];

  let logs = db.userStudyLogs.get(userId) || [];
  const existingToday = logs.find((l) => l.date === today);
  if (existingToday) {
    existingToday.minutes += sessionMins;
  } else {
    logs.push({ date: today, minutes: sessionMins });
  }
  db.userStudyLogs.set(userId, logs);

  // Award XP: 1 XP per minute studied
  const xpEarned = Math.round(sessionMins * 1.2);
  let badgeUnlocked = false;

  if (req.user) {
    req.user.xp += xpEarned;
    req.user.level = Math.floor(req.user.xp / 400) + 1;

    // Check Night Owl / Focus badge
    let userBadges = db.userBadges.get(req.user._id);
    if (!userBadges) {
      userBadges = new Set();
      db.userBadges.set(req.user._id, userBadges);
    }

    if (sessionMins >= 25 && !userBadges.has('night_owl')) {
      userBadges.add('night_owl');
      badgeUnlocked = true;
      const notifId = 'notif_' + Date.now();
      db.notifications.set(notifId, {
        _id: notifId,
        userId: req.user._id,
        title: '🏆 Achievement Unlocked: Dedicated Learner!',
        message: 'Completed an intense focus study session without distractions!',
        type: 'achievement',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/progress',
      });
    }
  }

  res.json({
    message: `Logged ${sessionMins} minutes of focused study time!`,
    xpEarned,
    badgeUnlocked,
  });
});
