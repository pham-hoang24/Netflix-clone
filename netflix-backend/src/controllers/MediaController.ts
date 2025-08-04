import { Request, Response } from 'express';
import { MediaService } from '../services/MediaService';

const mediaService = new MediaService();

export class MediaController {
  async getMovieDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id, type } = req.params;
      if (!id || !type || (type !== 'movie' && type !== 'tv')) {
        res.status(400).json({ error: 'Invalid media ID or type' });
        return;
      }
      const details = await mediaService.fetchAndProcessMediaDetails(parseInt(id as string), type as 'movie' | 'tv');
      res.json(details);
    } catch (error: any) {
      console.error('Error fetching media details:', error.message);
      res.status(500).json({ error: 'Failed to fetch media details' });
    }
  }

  async getTrending(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      if (type && type !== 'movie' && type !== 'tv') {
        res.status(400).json({ error: 'Invalid trending type' });
        return;
      }
      const trendingData = await mediaService.getTrending(type as 'movie' | 'tv' || 'movie'); // Default to movie if type is not provided
      res.json(trendingData);
    } catch (error: any) {
      console.error('Error fetching trending data:', error.message);
      res.status(500).json({ error: 'Failed to fetch trending data' });
    }
  }

  async getAllGenres(req: Request, res: Response): Promise<void> {
    try {
      const genres = await mediaService.getAllGenres();
      res.json(genres);
    } catch (error: any) {
      console.error('Error fetching genre data:', error.message);
      res.status(500).json({ error: 'Failed to fetch genre list' });
    }
  }

  async getTrendingWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const items = await mediaService.getTrendingWithDetails();
      res.json(items);
    } catch (error: any) {
      console.error('Error fetching trending data with details:', error.message);
      res.status(500).json({ error: 'Failed to fetch trending data with details' });
    }
  }

  async multiSearch(req: Request, res: Response): Promise<void> {
    try {
      const searchQuery = req.query.query as string;
      if (!searchQuery) {
        res.status(400).json({ error: 'Search query is required.' });
        return;
      }
      const searchResults = await mediaService.multiSearch(searchQuery);
      res.json(searchResults);
    } catch (error: any) {
      console.error('Error fetching multi-search data:', error.message);
      res.status(500).json({ error: 'Failed to fetch multi-search data.' });
    }
  }
}
