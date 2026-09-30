import { Router } from 'express';
import { db, Quiz, QuizResult } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';

export const quizzesRouter = Router();

// Get quizzes list
quizzesRouter.get('/', (_req, res) => {
  const quizzes = Array.from(db.quizzes.values()).map((q) => ({
    _id: q._id,
    title: q.title,
    subject: q.subject,
    topic: q.topic,
    difficulty: q.difficulty,
    durationMinutes: q.durationMinutes,
    questionCount: q.questions.length,
    isAIGenerated: q.isAIGenerated,
  }));
  res.json({ quizzes });
});

// Get quiz details including questions
quizzesRouter.get('/:id', (req, res) => {
  const quiz = db.quizzes.get(req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  res.json({ quiz });
});

// Submit Quiz Result
quizzesRouter.post('/:id/submit', authMiddleware, (req: AuthenticatedRequest, res) => {
  const quiz = db.quizzes.get(req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const userId = req.user?._id || 'user_demo_101';
  const { answers } = req.body; // map of questionId -> selectedIndex

  let correctCount = 0;
  const incorrectQuestions: string[] = [];

  quiz.questions.forEach((q) => {
    const selected = answers?.[q.id];
    if (selected !== undefined && selected === q.correctIndex) {
      correctCount += 1;
    } else {
      incorrectQuestions.push(q.question);
    }
  });

  const totalQuestions = quiz.questions.length;
  const wrongCount = totalQuestions - correctCount;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Gamification rewards
  const xpEarned = correctCount * 15 + 25; // 15 XP per correct + 25 participation

  // Performance message
  let performanceMessage = 'Great effort! Review your wrong answers to master these concepts.';
  if (percentage === 100) {
    performanceMessage = 'Outstanding performance! Absolute perfection! 🌟';
  } else if (percentage >= 80) {
    performanceMessage = 'Excellent work! You have a commanding grasp of this topic! 🚀';
  } else if (percentage >= 60) {
    performanceMessage = 'Good job! A quick revision of edge cases will boost your score to the top.';
  }

  // Recommended topics
  const recommendedTopics = incorrectQuestions.length > 0
    ? [quiz.topic + ' Fundamentals', 'Edge Cases & Exceptions']
    : ['Next Advanced Chapter in ' + quiz.subject];

  const resultId = 'res_' + Date.now();
  const quizResult: QuizResult = {
    _id: resultId,
    userId,
    quizId: quiz._id,
    quizTitle: quiz.title,
    subject: quiz.subject,
    totalQuestions,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    score: correctCount,
    percentage,
    xpEarned,
    recommendedTopics,
    completedAt: new Date().toISOString(),
  };

  db.quizResults.set(resultId, quizResult);

  // Update user stats & badges
  const badgesEarned: string[] = [];
  if (req.user) {
    req.user.xp += xpEarned;
    req.user.level = Math.floor(req.user.xp / 400) + 1;

    let userBadges = db.userBadges.get(req.user._id);
    if (!userBadges) {
      userBadges = new Set();
      db.userBadges.set(req.user._id, userBadges);
    }

    if (!userBadges.has('first_quiz')) {
      userBadges.add('first_quiz');
      badgesEarned.push('First Quiz');
    }

    if (percentage === 100 && !userBadges.has('perfect_score')) {
      userBadges.add('perfect_score');
      badgesEarned.push('Perfect Score');
    }

    // Check total questions answered
    const allResults = Array.from(db.quizResults.values()).filter((r) => r.userId === req.user?._id);
    const totalQAnswered = allResults.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    if (totalQAnswered >= 50 && !userBadges.has('q_100')) {
      userBadges.add('q_100');
      badgesEarned.push('100 Questions Completed');
    }

    if (badgesEarned.length > 0) {
      const notifId = 'notif_' + Date.now();
      db.notifications.set(notifId, {
        _id: notifId,
        userId: req.user._id,
        title: `🏆 New Badge Unlocked: ${badgesEarned[0]}!`,
        message: `Congratulations! You just earned the ${badgesEarned.join(', ')} achievement badge!`,
        type: 'achievement',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/profile',
      });
    }
  }

  res.json({
    result: quizResult,
    performanceMessage,
    badgesEarned,
  });
});

// Save AI-generated quiz to catalog
quizzesRouter.post('/save-ai-quiz', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { title, subject, topic, difficulty, questions } = req.body;
  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Valid questions array is required' });
  }

  const quizId = 'ai_quiz_' + Date.now();
  const newQuiz: Quiz = {
    _id: quizId,
    title: title || `${topic} AI Quiz`,
    subject: subject || 'General Academic',
    topic: topic || 'Custom Topic',
    difficulty: difficulty || 'Medium',
    durationMinutes: Math.max(5, Math.ceil(questions.length * 1.5)),
    questions: questions.map((q: any, i: number) => ({
      id: `ai_q_${quizId}_${i}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex ?? 0,
      explanation: q.explanation || 'Option correctly follows the concept rules.',
    })),
    isAIGenerated: true,
  };

  db.quizzes.set(quizId, newQuiz);
  res.status(201).json({ quiz: newQuiz });
});
