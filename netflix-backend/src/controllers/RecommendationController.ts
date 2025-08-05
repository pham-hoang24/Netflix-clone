import { Request, Response } from 'express';
import { RecommendationService } from '../services/RecommendationService';
import admin from 'firebase-admin';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class RecommendationController {
  private recommendationService: RecommendationService;

  constructor(db: admin.firestore.Firestore) {
    this.recommendationService = new RecommendationService(db);
    this.getPersonalizedRecommendations = this.getPersonalizedRecommendations.bind(this);
    this.getTrendingRecommendations = this.getTrendingRecommendations.bind(this);
  }

  async getPersonalizedRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recommendations = await this.recommendationService.getPersonalizedRecommendations(req.userId, limit);
      res.json(recommendations);
    } catch (error: any) {
      console.error('Error fetching personalized recommendations:', error.message);
      res.status(500).json({ error: 'Failed to fetch personalized recommendations' });
    }
  }

  async getTrendingRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const timeframe = req.query.timeframe as 'day' | 'week' | 'month' || 'week';
      const recommendations = await this.recommendationService.getTrendingRecommendations(timeframe);
      res.json(recommendations);
    } catch (error: any) {
      console.error('Error fetching trending recommendations:', error.message);
      res.status(500).json({ error: 'Failed to fetch trending recommendations' });
    }
  }
}
