/**
 * Dashboard Controller
 * User dashboard endpoints for stats, bookmarks, applications, activity
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { College } from '../models/College.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';

export const dashboardController = {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id;

      const [totalColleges, bookmarkCount] = await Promise.all([
        College.countDocuments({ status: 'active' }),
        userId ? User.findById(userId).select('bookmarks').lean().then(u => u?.bookmarks?.length || 0) : 0,
      ]);

      res.json({
        success: true,
        data: {
          totalColleges,
          bookmarks: bookmarkCount,
          applications: 0,   // Will be implemented with Application model
          recommendations: 8,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getBookmarks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user?._id)
        .populate('bookmarks')
        .lean();

      res.json({
        success: true,
        data: { bookmarks: user?.bookmarks || [] },
      });
    } catch (error) {
      next(error);
    }
  },

  async getApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Placeholder — Application model to be added
      res.json({
        success: true,
        data: { applications: [] },
      });
    } catch (error) {
      next(error);
    }
  },

  async getActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Placeholder — Activity tracking to be added
      res.json({
        success: true,
        data: { activity: [] },
      });
    } catch (error) {
      next(error);
    }
  },

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          views: [0, 0, 0, 0, 0, 0, 0],
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async toggleBookmark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { collegeId } = req.body;
      const userId = req.user?._id;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const index = user.bookmarks.findIndex(
        (b) => b.toString() === collegeId
      );

      if (index > -1) {
        user.bookmarks.splice(index, 1);
      } else {
        user.bookmarks.push(collegeId);
      }

      await user.save();

      res.json({
        success: true,
        data: { bookmarks: user.bookmarks },
        message: index > -1 ? 'Bookmark removed' : 'Bookmark added',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default dashboardController;
