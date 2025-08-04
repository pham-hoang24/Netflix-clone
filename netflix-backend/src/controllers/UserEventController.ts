import { Request, Response } from 'express';
import { UserEventService } from '../services/UserEventService';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const userEventService = new UserEventService();

export class UserEventController {
  async logEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { event, movieId, watchTimeSeconds, searchTerm, deviceType, sessionId, movieName, genre, publishDate, director, metadata = {} } = req.body;

      if (!event) {
        res.status(400).json({ error: 'Event type is required' });
        return;
      }

      const eventId = await userEventService.logEvent(req.userId!, req.userEmail, { event, movieId, watchTimeSeconds, searchTerm, deviceType, sessionId, movieName, genre, publishDate, director, metadata });
      
      res.status(201).json({
        success: true,
        eventId,
        message: 'Event logged successfully'
      });

    } catch (error: any) {
      console.error('Error logging event:', error.message);
      res.status(500).json({ error: 'Failed to log event' });
    }
  }

  async getUserEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { limit = '50', eventType } = req.query;
      const events = await userEventService.getEvents(req.userId!, parseInt(limit as string), eventType as string);

      res.json({ events, total: events.length });
    } catch (error: any) {
      console.error('Error fetching user events:', error.message);
      res.status(500).json({ error: 'Failed to fetch user events' });
    }
  }
}
