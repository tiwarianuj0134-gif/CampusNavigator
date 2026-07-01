import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { AuthRequest } from '../middlewares/auth.js';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokens(refreshToken);

      res.json({
        success: true,
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await authService.logout(req.user._id.toString());
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!._id.toString());

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(
        req.user!._id.toString(),
        req.body
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.updatePassword(
        req.user!._id.toString(),
        currentPassword,
        newPassword
      );

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
