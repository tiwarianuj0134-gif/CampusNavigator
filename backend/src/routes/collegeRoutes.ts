import { Router } from 'express';
import { collegeController } from '../controllers/collegeController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.get('/', collegeController.getAll);
router.get('/featured', collegeController.getFeatured);
router.get('/search', collegeController.search);      // Hybrid search (DB + AI)
router.get('/discover', collegeController.discover);   // AI-only discovery
router.get('/compare', collegeController.compare);
router.get('/slug/:slug', collegeController.getBySlug);
router.get('/:id', collegeController.getById);
router.get('/:id/reviews', collegeController.getReviews);
router.get('/:id/courses', collegeController.getCourses);
router.get('/:id/placements', collegeController.getPlacements);

// Admin routes
router.post('/', authenticate, authorize('admin'), collegeController.create);
router.patch('/:id', authenticate, authorize('admin'), collegeController.update);
router.delete('/:id', authenticate, authorize('admin'), collegeController.delete);
router.patch('/:id/status', authenticate, authorize('admin', 'moderator'), collegeController.updateStatus);

export default router;
