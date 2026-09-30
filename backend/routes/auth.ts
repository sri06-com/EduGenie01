import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, User } from '../db.js';
import { authMiddleware, AuthenticatedRequest, JWT_SECRET } from '../authMiddleware.js';

export const authRouter = Router();

// Sign Up
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, educationLevel, course, department, semester, selectedSubjects } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existing = Array.from(db.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = 'user_' + Date.now();

    const newUser: User = {
      _id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      educationLevel: educationLevel || 'College / University',
      course: course || 'Computer Science & Engineering',
      department: department || 'Engineering',
      semester: semester || 'Semester 1',
      profileImage: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      xp: 200, // Welcome bonus XP!
      level: 1,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      selectedSubjects: selectedSubjects || ['Java Programming', 'Database Management Systems'],
      createdAt: new Date().toISOString(),
    };

    db.users.set(userId, newUser);
    db.userBadges.set(userId, new Set(['first_quiz']));

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = Array.from(db.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check streak
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (user.lastActiveDate === yesterday) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
      user.lastActiveDate = today;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      message: 'Logged in successfully',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Demo Login (One-click instant login with pre-populated rich data)
authRouter.post('/demo-login', async (_req, res) => {
  const demoUser = db.users.get('user_demo_101') || Array.from(db.users.values())[0];
  if (!demoUser) {
    return res.status(404).json({ error: 'Demo user not available' });
  }

  const token = jwt.sign({ userId: demoUser._id }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = demoUser;

  return res.json({
    message: 'Welcome to EduGenie Demo!',
    token,
    user: safeUser,
  });
});

// Forgot Password
authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please enter your registered email' });
  }

  const user = Array.from(db.users.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address' });
  }

  // Simulated secure reset
  return res.json({
    message: `Password reset instructions have been sent to ${email}. Check your inbox!`,
    temporaryToken: 'rst_' + Math.random().toString(36).substring(2, 10),
  });
});

// Current User Profile
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { passwordHash: _, ...safeUser } = req.user;
  const userBadgeIds = db.userBadges.get(req.user._id) || new Set();
  const badges = db.badgesDefinition.map((b) => ({
    ...b,
    isUnlocked: userBadgeIds.has(b.id),
  }));

  return res.json({
    user: safeUser,
    badges,
  });
});

// Update Profile
authRouter.put('/profile', authMiddleware, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { name, educationLevel, course, department, semester, profileImage, selectedSubjects } = req.body;

  if (name) req.user.name = name;
  if (educationLevel) req.user.educationLevel = educationLevel;
  if (course) req.user.course = course;
  if (department) req.user.department = department;
  if (semester) req.user.semester = semester;
  if (profileImage) req.user.profileImage = profileImage;
  if (selectedSubjects && Array.isArray(selectedSubjects)) req.user.selectedSubjects = selectedSubjects;

  db.users.set(req.user._id, req.user);

  const { passwordHash: _, ...safeUser } = req.user;
  return res.json({
    message: 'Profile updated successfully',
    user: safeUser,
  });
});
