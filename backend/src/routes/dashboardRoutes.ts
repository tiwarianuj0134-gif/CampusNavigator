import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/bookmarks', dashboardController.getBookmarks);
router.get('/applications', dashboardController.getApplications);
router.get('/activity', dashboardController.getActivity);
router.get('/analytics', dashboardController.getAnalytics);
router.post('/bookmarks/toggle', dashboardController.toggleBookmark);

export default router;
