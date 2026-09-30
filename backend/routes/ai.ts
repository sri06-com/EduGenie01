import { Router } from 'express';
import { db, ChatMessage } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../authMiddleware.js';
import { askGenieAI, generateAINotes, generateAIQuiz } from '../aiService.js';

export const aiRouter = Router();

// Chat with Genie AI
aiRouter.post('/chat', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { message, mode, language } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userId = req.user?._id || 'user_demo_101';
    let userMessages = db.userChatHistory.get(userId) || [];

    // Add user message
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString(),
      mode,
    };
    userMessages.push(userMsg);

    // Call Genie AI
    const replyText = await askGenieAI({
      message,
      mode: mode || 'Explain simply',
      language: language || 'en',
      educationLevel: req.user?.educationLevel,
      course: req.user?.course,
    });

    // Add assistant response
    const assistantMsg: ChatMessage = {
      id: 'msg_' + (Date.now() + 1),
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toISOString(),
      mode,
    };
    userMessages.push(assistantMsg);
    db.userChatHistory.set(userId, userMessages);

    // Reward XP (+10 XP) and check curious_mind badge
    let badgeUnlocked = false;
    let unlockedBadgeName = '';
    if (req.user) {
      req.user.xp += 10;
      req.user.level = Math.floor(req.user.xp / 400) + 1;

      let userBadges = db.userBadges.get(req.user._id);
      if (!userBadges) {
        userBadges = new Set();
        db.userBadges.set(req.user._id, userBadges);
      }

      if (userMessages.length >= 6 && !userBadges.has('curious_mind')) {
        userBadges.add('curious_mind');
        badgeUnlocked = true;
        unlockedBadgeName = 'Curious Mind';

        const notifId = 'notif_' + Date.now();
        db.notifications.set(notifId, {
          _id: notifId,
          userId: req.user._id,
          title: '🏆 Achievement Unlocked: Curious Mind!',
          message: 'You have actively engaged with Genie AI to supercharge your learning!',
          type: 'achievement',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/ai-assistant',
        });
      }
    }

    res.json({
      message: assistantMsg,
      xpEarned: 10,
      badgeUnlocked,
      unlockedBadgeName,
    });
  } catch (error) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({ error: 'Failed to process AI chat response' });
  }
});

// Get user chat history
aiRouter.get('/chat-history', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id || 'user_demo_101';
  const history = db.userChatHistory.get(userId) || [];
  res.json({ messages: history });
});

// Clear chat history
aiRouter.delete('/clear-chat', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id || 'user_demo_101';
  db.userChatHistory.set(userId, [
    {
      id: 'msg_welcome_' + Date.now(),
      sender: 'assistant',
      text: 'Chat history cleared! 🌟 What would you like to explore or revise next?',
      timestamp: new Date().toISOString(),
    },
  ]);
  res.json({ success: true });
});

// Generate Notes
aiRouter.post('/generate-notes', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { topic, subject, lengthType, language } = req.body;

    if (!topic || !subject) {
      return res.status(400).json({ error: 'Topic and subject are required' });
    }

    const noteData = await generateAINotes({
      topic,
      subject,
      lengthType: lengthType || 'Detailed',
      language: language || 'en',
    });

    res.json({ noteData });
  } catch (error) {
    console.error('Error generating notes:', error);
    res.status(500).json({ error: 'Failed to generate study notes' });
  }
});

// Generate Quiz
aiRouter.post('/generate-quiz', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { topic, subject, difficulty, numQuestions } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const quizData = await generateAIQuiz({
      topic,
      subject: subject || 'General Academic',
      difficulty: difficulty || 'Medium',
      numQuestions: Number(numQuestions) || 5,
    });

    res.json({ quiz: quizData });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Personalized AI Study Recommendations
aiRouter.get('/recommendations', authMiddleware, (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id || 'user_demo_101';
  const userResults = Array.from(db.quizResults.values()).filter((r) => r.userId === userId);

  let weakSubjects: string[] = [];
  if (userResults.length > 0) {
    weakSubjects = userResults
      .filter((r) => r.percentage < 85)
      .map((r) => r.subject);
  }

  if (weakSubjects.length === 0) {
    weakSubjects = ['Java Programming', 'Database Management Systems'];
  }

  const recommendations = [
    {
      id: 'rec_1',
      title: 'Revise Dynamic Method Dispatch',
      subject: 'Java Programming',
      reason: 'Reinforces polymorphism concepts tested in recent exams',
      type: 'quiz',
      actionUrl: '/quizzes',
    },
    {
      id: 'rec_2',
      title: 'Practice BCNF Normalization Problems',
      subject: 'Database Management Systems',
      reason: 'Frequently tested 10-mark question with highest scoring potential',
      type: 'material',
      actionUrl: '/materials',
    },
    {
      id: 'rec_3',
      title: 'Generate Notes on Dynamic Programming',
      subject: 'Data Structures & Algorithms',
      reason: 'Master recurrence relations and state transitions with Genie AI',
      type: 'notes',
      actionUrl: '/notes',
    },
  ];

  res.json({ recommendations });
});
