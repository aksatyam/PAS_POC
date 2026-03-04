import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../models';
import { errorResponse } from '../utils/response';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const tokenBlacklist: Set<string> = new Set();

export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Access denied. No token provided.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  if (isTokenBlacklisted(token)) {
    errorResponse(res, 'Token has been invalidated.', 401);
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    errorResponse(res, 'Invalid or expired token.', 401);
  }
}
