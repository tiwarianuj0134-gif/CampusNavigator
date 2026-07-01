/**
 * Admin Routes
 * High-level admin dashboard stats and management
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { College } from '../models/College.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin', 'moderator'));

/**
 * GET /api/admin/stats
 * Returns platform-wide stats for the admin dashboard
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [totalColleges, totalUsers, totalReviews, pendingReviews] = await Promise.all([
      College.countDocuments({ status: 'active' }),
      User.countDocuments(),
      Review.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      success: true,
      data: {
        totalColleges,
        totalUsers,
        totalReviews,
        pendingReviews,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/reviews?status=pending|approved|rejected
 */
router.get('/reviews', async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const reviews = await Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('college', 'name coverImage address')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const formattedReviews = reviews.map((r: any) => ({
      id: r._id.toString(),
      userName: r.user?.name || 'Anonymous',
      userEmail: r.user?.email || '',
      collegeId: r.college?._id?.toString() || r.college?.toString() || '',
      collegeName: r.college?.name || 'Unknown College',
      rating: r.rating || 0,
      title: r.title || '',
      content: r.content || '',
      status: r.status || 'pending',
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '',
    }));

    res.json({
      success: true,
      data: { reviews: formattedReviews },
      pagination: { page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/reviews/:id
 * Approve or reject a review
 */
router.patch('/reviews/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
      return;
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    res.json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/analytics/user-growth
 */
router.get('/analytics/user-growth', async (req, res, next) => {
  try {
    // Get user registrations per month for the last 7 months
    const months: string[] = [];
    const counts: number[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push(label);
      try {
        const count = await User.countDocuments({
          createdAt: { $gte: d, $lte: end },
        });
        counts.push(count);
      } catch {
        counts.push(0);
      }
    }

    res.json({
      success: true,
      data: { labels: months, data: counts },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
