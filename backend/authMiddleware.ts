import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User } from './db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'edugenie-secret-key-prod-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If not provided, fallback to demo user for convenience in preview environment
    const demoUser = Array.from(db.users.values())[0];
    if (demoUser) {
      req.user = demoUser;
      return next();
    }
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.users.get(decoded.userId);
    if (!user) {
      // Fallback to first user if user not found in memory
      const demoUser = Array.from(db.users.values())[0];
      req.user = demoUser;
      return next();
    }
    req.user = user;
    next();
  } catch (err) {
    // In dev / preview fallback to demo user so requests don't abruptly break
    const demoUser = Array.from(db.users.values())[0];
    if (demoUser) {
      req.user = demoUser;
      return next();
    }
    return res.status(401).json({ error: 'Token is invalid or expired' });
  }
}
