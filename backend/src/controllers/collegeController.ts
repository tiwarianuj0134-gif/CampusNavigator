/**
 * College Controller
 * Handles all college endpoints including hybrid search
 */

import { Request, Response, NextFunction } from 'express';
import { collegeService } from '../services/collegeService.js';
import { dynamicSearchService } from '../services/dynamicSearchService.js';
import { AuthRequest } from '../middlewares/auth.js';

export const collegeController = {
  // GET /api/colleges — list with filters & pagination
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await collegeService.getAll({
        search: req.query.search as string,
        city: req.query.city as string,
        state: req.query.state as string,
        type: req.query.type as string,
        stream: req.query.stream as string,
        minFees: req.query.minFees ? Number(req.query.minFees) : undefined,
        maxFees: req.query.maxFees ? Number(req.query.maxFees) : undefined,
        minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
        approvals: req.query.approvals ? (req.query.approvals as string).split(',') : undefined,
        sort: req.query.sort as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 12,
      });

      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/colleges/search?q=... — HYBRID SEARCH (DB + AI fallback)
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q || req.query.search || '') as string;
      if (!query || query.trim().length < 2) {
        res.json({ success: true, data: { results: [], source: 'none' } });
        return;
      }

      // Step 1: Search MongoDB
      const dbResult = await collegeService.getAll({
        search: query,
        page: 1,
        limit: 10,
      });

      if (dbResult.data.length >= 5) {
        // Enough DB results — return them
        res.json({
          success: true,
          data: {
            results: dbResult.data,
            source: 'database',
            total: dbResult.pagination.total,
          },
        });
        return;
      }

      // Step 2: DB results insufficient — enhance with AI discovery
      const aiResults = await dynamicSearchService.searchGeminiForColleges(query);

      // Merge: DB results first, then AI results (deduplicated)
      const dbNames = new Set(dbResult.data.map((c: any) => c.name.toLowerCase()));
      const aiFiltered = aiResults.filter(r => !dbNames.has(r.name.toLowerCase()));

      res.json({
        success: true,
        data: {
          results: [...dbResult.data, ...aiFiltered],
          dbCount: dbResult.data.length,
          aiCount: aiFiltered.length,
          source: aiFiltered.length > 0 ? 'hybrid' : 'database',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/colleges/discover?q=... — AI-only discovery for unknown colleges
  async discover(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        res.json({ success: true, data: { results: [] } });
        return;
      }
      const results = await dynamicSearchService.search(query);
      res.json({ success: true, data: { results } });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/colleges/featured
  async getFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 6;
      const colleges = await collegeService.getFeatured(limit);
      res.json({ success: true, data: { colleges } });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/colleges/compare?ids=id1,id2
  async compare(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = (req.query.ids as string || '').split(',').filter(Boolean);
      if (ids.length < 2) {
        res.status(400).json({ success: false, message: 'Provide at least 2 college IDs' });
        return;
      }
      const colleges = await collegeService.compare(ids);
      res.json({ success: true, data: { colleges } });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/colleges/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const college = await collegeService.getById(req.params.id);
      res.json({ success: true, data: { college } });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/colleges/slug/:slug
  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const college = await collegeService.getBySlug(req.params.slug);
      res.json({ success: true, data: { college } });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/colleges/:id/reviews
  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const result = await collegeService.getReviews(req.params.id, page, limit);
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/colleges/:id/courses
  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await collegeService.getCourses(req.params.id);
      res.json({ success: true, data: { courses } });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/colleges/:id/placements
  async getPlacements(req: Request, res: Response, next: NextFunction) {
    try {
      const placements = await collegeService.getPlacements(req.params.id);
      res.json({ success: true, data: { placements } });
    } catch (error) {
      next(error);
    }
  },

  // Admin: POST /api/colleges
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const college = await collegeService.create(req.body);
      res.status(201).json({ success: true, data: { college } });
    } catch (error) {
      next(error);
    }
  },

  // Admin: PATCH /api/colleges/:id
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const college = await collegeService.update(req.params.id, req.body);
      res.json({ success: true, data: { college } });
    } catch (error) {
      next(error);
    }
  },

  // Admin: DELETE /api/colleges/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await collegeService.delete(req.params.id);
      res.json({ success: true, message: 'College deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Admin: PATCH /api/colleges/:id/status
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const college = await collegeService.updateStatus(req.params.id, req.body.status, req.user!._id.toString());
      res.json({ success: true, data: { college } });
    } catch (error) {
      next(error);
    }
  },
};

export default collegeController;
