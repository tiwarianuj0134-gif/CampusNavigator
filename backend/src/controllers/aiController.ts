import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/aiService.js';
import { AuthRequest } from '../middlewares/auth.js';

export const aiController = {
  async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const preferences = req.user?.preferences || req.body.preferences;
      const limit = req.query.limit ? Number(req.query.limit) : 5;

      const recommendations = await aiService.getRecommendations(preferences, limit);

      res.json({
        success: true,
        data: { recommendations },
      });
    } catch (error) {
      next(error);
    }
  },

  async getExplanation(req: Request, res: Response, next: NextFunction) {
    try {
      const { collegeName, preferences } = req.body;
      
      const explanation = await aiService.getRecommendationExplanation(
        collegeName,
        preferences
      );

      res.json({
        success: true,
        data: { explanation },
      });
    } catch (error) {
      next(error);
    }
  },

  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, context } = req.body;
      
      const response = await aiService.chat(message, context);

      res.json({
        success: true,
        data: { response },
      });
    } catch (error) {
      next(error);
    }
  },

  async getOnboardingSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { answers } = req.body;
      
      const suggestions = await aiService.getOnboardingSuggestions(answers);

      res.json({
        success: true,
        data: { suggestions },
      });
    } catch (error) {
      next(error);
    }
  },

  async enrichCollege(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, city, state } = req.body;
      if (!name) {
        res.status(400).json({ success: false, message: 'College name is required' });
        return;
      }

      const enriched = await aiService.enrichCollegeDetails(
        name,
        city || '',
        state || ''
      );

      res.json({
        success: true,
        data: { enriched },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default aiController;
