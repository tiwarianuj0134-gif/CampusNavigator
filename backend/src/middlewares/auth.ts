import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { User, IUser } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authenticated. Please log in.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User no longer exists.', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please log in again.', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired. Please log in again.', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Not authenticated.', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('Not authorized to access this resource.', 403));
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch {
    // Continue without user
    next();
  }
};
