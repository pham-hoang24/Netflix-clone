import admin from 'firebase-admin';
import { db } from './FirestoreDAO'; // Assuming db is exported from FirestoreDAO

export interface EventLogRequest {
  event: string;
  movieId?: string;
  watchTimeSeconds?: number;
  searchTerm?: string;
  deviceType?: string;
  sessionId?: string;
  movieName?: string;
  genre?: string;
  publishDate?: string;
  director?: string;
  metadata?: Record<string, any>;
}

export async function logUserEvent(userId: string, userEmail: string | undefined, eventData: EventLogRequest): Promise<string> {
  try {
    const dataToSave: Record<string, any> = {
      userId,
      userEmail,
      event: eventData.event,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      serverTimestamp: new Date().toISOString(), // Backup timestamp
      ...(eventData.movieId && { movieId: eventData.movieId }),
      ...(eventData.watchTimeSeconds !== undefined && { watchTimeSeconds: eventData.watchTimeSeconds }),
      ...(eventData.searchTerm && { searchTerm: eventData.searchTerm }),
      ...(eventData.deviceType && { deviceType: eventData.deviceType }),
      ...(eventData.sessionId && { sessionId: eventData.sessionId }),
      ...(eventData.movieName && { movieName: eventData.movieName }),
      ...(eventData.genre && { genre: eventData.genre }),
      ...(eventData.publishDate && { publishDate: eventData.publishDate }),
      ...(eventData.director && { director: eventData.director }),
      ...(eventData.metadata && { metadata: eventData.metadata }),
    };

    const docRef = await db.collection('userEvents').add(dataToSave);
    console.log(`Event logged: ${eventData.event} for user ${userId}, docId: ${docRef.id}`);
    return docRef.id;
  } catch (error: any) {
    console.error('Error logging event to Firestore:', error.message);
    throw error;
  }
}

export async function getUserEvents(userId: string, limit: number, eventType?: string): Promise<any[]> {
  try {
    let query = db.collection('userEvents')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    if (eventType) {
      query = query.where('event', '==', eventType);
    }

    const snapshot = await query.get();
    const events: any[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.serverTimestamp
      });
    });
    return events;
  } catch (error: any) {
    console.error('Error fetching user events from Firestore:', error.message);
    throw error;
  }
}
