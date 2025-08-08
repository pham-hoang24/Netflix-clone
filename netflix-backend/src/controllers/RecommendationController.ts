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
  }

  async getPersonalizedRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recommendations = await this.recommendationService.getPersonalizedRecommendations(req.userId, limit);
      console.log("[RecommendationController] Sending personalized recommendations:", JSON.stringify(recommendations, null, 2));
      res.json(recommendations);
    } catch (error: any) {
      console.error('Error fetching personalized recommendations:', error.message);
      res.status(500).json({ error: 'Failed to fetch personalized recommendations' });
    }
  }

  async getMoviesByGenres(req: Request, res: Response): Promise<void> {
    try {
      const { genreIds } = req.body;
      if (!genreIds || !Array.isArray(genreIds) || genreIds.length === 0) {
        res.status(400).json({ error: 'genreIds array is required in the request body' });
        return;
      }
      const movies = await this.recommendationService.getMoviesByGenres(genreIds);
      res.json(movies);
    } catch (error: any) {
      console.error('Error fetching movies by genres:', error.message);
      res.status(500).json({ error: 'Failed to fetch movies by genres' });
    }
  }
}
