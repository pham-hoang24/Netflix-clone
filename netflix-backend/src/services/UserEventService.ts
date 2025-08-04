import { logUserEvent, getUserEvents, EventLogRequest } from '../dao/UserEventDAO';

export class UserEventService {
  async logEvent(userId: string, userEmail: string | undefined, eventData: EventLogRequest): Promise<string> {
    return logUserEvent(userId, userEmail, eventData);
  }

  async getEvents(userId: string, limit: number, eventType?: string): Promise<any[]> {
    return getUserEvents(userId, limit, eventType);
  }
}
