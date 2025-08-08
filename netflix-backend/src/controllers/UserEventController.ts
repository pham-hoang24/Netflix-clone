import { Request, Response } from 'express';
import { UserEventService } from '../services/UserEventService';
import { UserEvent } from '../types/recommendation';
import admin from 'firebase-admin';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export class UserEventController {
  private userEventService: UserEventService;

  constructor(db: admin.firestore.Firestore) {
    this.userEventService = new UserEventService(db);
    this.logEvent = this.logEvent.bind(this);
    this.getUserEvents = this.getUserEvents.bind(this);
  }

  async logEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        event,
        movieId,
        watchTimeSeconds,
        searchTerm,
        deviceType,
        sessionId,
        movieName,
        genre,
        director,
        rating,
        completionPercentage,
        tmdbId,
        contentType,
        language,
        releaseYear,
        metadata = {}
      }: UserEvent = req.body;

      if (!event) {
        res.status(400).json({ error: 'Event type is required' });
        return;
      }

      const eventId = await this.userEventService.logEvent(req.userId!, req.userEmail, {
        userId: req.userId!,
        event,
        timestamp: new Date(), // Will be overwritten by serverTimestamp in DAO
        movieId,
        watchTimeSeconds,
        searchTerm,
        deviceType,
        sessionId,
        movieName,
        genre,
        director,
        rating,
        completionPercentage,
        tmdbId,
        contentType,
        language,
        releaseYear,
        metadata
      });
      
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
      const events = await this.userEventService.getEvents(req.userId!, parseInt(limit as string), eventType as string);

      res.json({ events, total: events.length });
    } catch (error: any) {
      console.error('Error fetching user events:', error.message);
      res.status(500).json({ error: 'Failed to fetch user events' });
    }
  }
}
