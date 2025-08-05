import { UserEventDAO } from '../dao/UserEventDAO';
import { UserEvent } from '../types/recommendation';
import admin from 'firebase-admin';

export class UserEventService {
  private userEventDAO: UserEventDAO;

  constructor(dbInstance: admin.firestore.Firestore) {
    this.userEventDAO = new UserEventDAO(dbInstance);
  }

  async logEvent(userId: string, userEmail: string | undefined, eventData: UserEvent): Promise<string> {
    // The userId is already part of eventData.userId, so we just pass eventData
    return this.userEventDAO.createEvent(eventData);
  }

  async getEvents(userId: string, limit: number, eventType?: string): Promise<UserEvent[]> {
    return this.userEventDAO.getUserEvents(userId, limit, eventType);
  }
}
