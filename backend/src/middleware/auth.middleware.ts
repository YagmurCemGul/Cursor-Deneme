import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * Extended Request interface with user info
 */
export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided. Please include Authorization header with Bearer token.'
      });
      return;
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token is empty'
      });
      return;
    }

    // Verify token
    const payload = verifyToken(token);

    // Attach user info to request
    req.userId = payload.userId;
    req.userEmail = payload.email;

    next();
  } catch (error: any) {
    console.error('[Auth Middleware] Error:', error.message);
    
    res.status(401).json({
      error: 'Unauthorized',
      message: error.message || 'Invalid or expired token'
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is provided, but doesn't require it
 */
export function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      req.userId = payload.userId;
      req.userEmail = payload.email;
    }
    
    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
}
