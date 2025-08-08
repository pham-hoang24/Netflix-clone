import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware';
import { UserEventController } from '../controllers/UserEventController';
import { MediaController } from '../controllers/MediaController';
import { RecommendationController } from '../controllers/RecommendationController';
import admin from 'firebase-admin';

export default (db: admin.firestore.Firestore) => {
  const router = Router();
  const userEventController = new UserEventController(db);
  const mediaController = new MediaController();
  const recommendationController = new RecommendationController(db);

  // User Event Routes
  router.post('/log-event', authenticateUser, userEventController.logEvent);
  router.get('/user-events', authenticateUser, userEventController.getUserEvents);

  // Media Routes
  router.get('/movie-details/:id/:type', mediaController.getMovieDetails);
  router.get('/trending', mediaController.getTrending);
  router.get('/trending/:type', mediaController.getTrending);
  router.get('/genres', mediaController.getAllGenres);
  router.get('/trending-with-details', mediaController.getTrendingWithDetails);
  router.get('/search/multi', mediaController.multiSearch);

  // Recommendation Routes
  router.get('/recommendations/personalized', authenticateUser, recommendationController.getPersonalizedRecommendations);
  router.post('/recommendations/by-genres', authenticateUser, recommendationController.getMoviesByGenres);

  // Health Check
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        tmdb: !!process.env.TMDB_API_KEY,
        firebase: true // Assuming Firebase is initialized via FirestoreDAO
      }
    });
  });

  return router;
};