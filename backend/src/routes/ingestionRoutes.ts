/**
 * Ingestion Routes
 * Admin-only endpoints for data ingestion, moderation, and scraper management
 */

import { Router } from 'express';
import { ingestionController } from '../controllers/ingestionController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All routes require admin auth
router.use(authenticate, authorize('admin', 'moderator'));

// ─── Moderation Queue ─────────────────────────────────────────
router.get('/moderation', ingestionController.getModerationQueue);
router.post('/moderation/:id/approve', ingestionController.approveInstitution);
router.post('/moderation/:id/reject', ingestionController.rejectInstitution);
router.post('/moderation/bulk-approve', ingestionController.bulkApprove);

// ─── Placement Management ─────────────────────────────────────
router.post('/placements/upload', ingestionController.uploadPlacement);
router.post('/placements/parse-text', ingestionController.parsePlacementText);

// ─── Scraper Management ───────────────────────────────────────
router.get('/scrapers/status', ingestionController.getScraperStatus);
router.post('/scrapers/trigger/:jobKey', ingestionController.triggerScraper);

// ─── Logs & Stats ─────────────────────────────────────────────
router.get('/logs', ingestionController.getIngestionLogs);
router.get('/stats', ingestionController.getIngestionStats);

export default router;
