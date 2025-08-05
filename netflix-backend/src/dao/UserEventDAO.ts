import admin from 'firebase-admin';
import { UserEvent } from '../types/recommendation';

export class UserEventDAO {
  private db: admin.firestore.Firestore;

  constructor(dbInstance: admin.firestore.Firestore) {
    this.db = dbInstance;
  }

  async createEvent(eventData: UserEvent): Promise<string> {
    const batch = this.db.batch();

    // Helper to remove undefined values
    const removeUndefined = (obj: any) => {
      return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== undefined)
      );
    };
    
    const cleanedEventData = removeUndefined(eventData);

    // Store in main userEvents collection for recommendations
    const eventRef = this.db.collection('userEvents').doc();
    batch.set(eventRef, {
      ...cleanedEventData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      serverTimestamp: new Date().toISOString(),
    });

    // ALSO store in user subcollection for user-specific queries
    const userEventRef = this.db
      .collection('users')
      .doc(eventData.userId)
      .collection('events')
      .doc(eventRef.id);
    
    const { userId, ...eventDataWithoutUserId } = cleanedEventData; // Use cleaned data here too
    batch.set(userEventRef, {
      ...eventDataWithoutUserId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      serverTimestamp: new Date().toISOString(),
    });

    await batch.commit();
    return eventRef.id;
  }

  async getUserEvents(userId: string, limit: number = 50, eventType?: string): Promise<UserEvent[]> {
    let query = this.db
      .collection('users')
      .doc(userId)
      .collection('events')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (eventType) {
      query = query.where('event', '==', eventType);
    }

    const snapshot = await query.get();
    return this.mapEventsFromSnapshot(snapshot, userId);
  }

  async getEventsForRecommendations(filters: {
    movieIds?: string[];
    genres?: string[];
    eventTypes?: string[];
    minRating?: number;
    timeframe?: { start: Date; end: Date };
    limit?: number;
  }): Promise<UserEvent[]> {
    let query: admin.firestore.Query = this.db.collection('userEvents');

    if (filters.movieIds?.length) {
      query = query.where('movieId', 'in', filters.movieIds.slice(0, 10)); // Firestore limit
    }

    if (filters.eventTypes?.length) {
      query = query.where('event', 'in', filters.eventTypes);
    }

    if (filters.minRating) {
      query = query.where('rating', '>=', filters.minRating);
    }

    if (filters.timeframe) {
      query = query
        .where('timestamp', '>=', filters.timeframe.start)
        .where('timestamp', '<=', filters.timeframe.end);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    return this.mapEventsFromSnapshot(snapshot);
  }

  async findSimilarUsers(userId: string, movieIds: string[], limit: number = 50): Promise<string[]> {
    const snapshot = await this.db.collection('userEvents')
      .where('movieId', 'in', movieIds.slice(0, 10))
      .where('event', 'in', ['movie_completed', 'positive_rating'])
      .where('userId', '!=', userId)
      .limit(limit * 2) // Get more to filter duplicates
      .get();

    const userCounts: Record<string, number> = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      userCounts[data.userId] = (userCounts[data.userId] || 0) + 1;
    });

    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([userId]) => userId);
  }

  async getTrendingContent(timeframe: Date, limit: number = 20): Promise<Array<{movieId: string, count: number}>> {
    const snapshot = await this.db.collection('userEvents')
      .where('timestamp', '>=', timeframe)
      .where('event', 'in', ['movie_view', 'movie_completed'])
      .get();

    const movieCounts: Record<string, number> = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.movieId) {
        movieCounts[data.movieId] = (movieCounts[data.movieId] || 0) + 1;
      }
    });

    return Object.entries(movieCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([movieId, count]) => ({ movieId, count }));
  }

  private mapEventsFromSnapshot(snapshot: admin.firestore.QuerySnapshot, userId?: string): UserEvent[] {
    const events: UserEvent[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        userId: userId || data.userId, // Use provided userId for subcollection queries
        timestamp: data.timestamp?.toDate?.() || new Date(data.serverTimestamp)
      } as UserEvent);
    });
    return events;
  }
}
