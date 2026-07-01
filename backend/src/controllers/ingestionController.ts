/**
 * Ingestion Controller
 * Admin endpoints for data moderation, scraper management, and placement upload
 */

import { Request, Response, NextFunction } from 'express';
import { ingestionService } from '../services/ingestionService.js';
import { scheduler } from '../jobs/scheduler.js';
import { AuthRequest } from '../middlewares/auth.js';
import { PlacementPdfParser } from '../parsers/PlacementPdfParser.js';

export const ingestionController = {
  // ─── Moderation Queue ───────────────────────────────────────

  async getModerationQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const { source, page, limit } = req.query;
      const result = await ingestionService.getModerationQueue(
        source as string,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async approveInstitution(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { overrides } = req.body;
      const result = await ingestionService.approveInstitution(
        id,
        req.user!._id.toString(),
        overrides
      );

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async rejectInstitution(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const result = await ingestionService.rejectInstitution(
        id,
        req.user!._id.toString(),
        note
      );

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async bulkApprove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      const results = await ingestionService.bulkApprove(
        ids,
        req.user!._id.toString()
      );

      res.json({ success: true, data: { results } });
    } catch (error) {
      next(error);
    }
  },

  // ─── Placement Upload ──────────────────────────────────────

  async uploadPlacement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { collegeId, academicYear, data } = req.body;

      // Manual JSON placement data upload
      const result = await ingestionService.ingestPlacement(
        collegeId,
        data,
        'manual',
        req.user!._id.toString()
      );

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async parsePlacementText(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, academicYear } = req.body;

      // Parse placement data from pasted text
      const parser = new PlacementPdfParser();
      const parsed = parser.extractData(text, academicYear || '2023-24');

      res.json({ success: true, data: { parsed } });
    } catch (error) {
      next(error);
    }
  },

  // ─── Scraper Management ─────────────────────────────────────

  async triggerScraper(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobKey } = req.params;
      const result = await scheduler.triggerJob(
        jobKey,
        req.user!._id.toString()
      );

      res.json({ success: true, data: { stats: result.stats, errors: result.errors.slice(0, 10) } });
    } catch (error) {
      next(error);
    }
  },

  async getScraperStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = scheduler.getStatus();
      res.json({ success: true, data: { jobs: status } });
    } catch (error) {
      next(error);
    }
  },

  // ─── Logs & Stats ──────────────────────────────────────────

  async getIngestionLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { source, limit } = req.query;
      const logs = await ingestionService.getLogs(
        source as string,
        limit ? Number(limit) : 20
      );

      res.json({ success: true, data: { logs } });
    } catch (error) {
      next(error);
    }
  },

  async getIngestionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ingestionService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};

export default ingestionController;
