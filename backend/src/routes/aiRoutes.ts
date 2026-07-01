import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';

const router = Router();

// AI endpoints
router.post('/recommendations', optionalAuth, aiController.getRecommendations);
router.post('/recommend', optionalAuth, aiController.getRecommendations);  // alias
router.post('/explanation', aiController.getExplanation);
router.post('/chat', aiController.chat);
router.post('/onboarding-suggestions', aiController.getOnboardingSuggestions);
router.post('/enrich-college', aiController.enrichCollege);

export default router;
