import { auth } from './firebase';
import axios, { AxiosResponse } from 'axios';

interface LogEventPayload {
  event: string;
  movieId?: string;
  watchTimeSeconds?: number;
  deviceType?: string;
  searchTerm?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  movieName?: string;
  genre?: Array<{ id: number; name: string }>;
  publishDate?: string;
  director?: string;
  eventType?: string; // Added for specific event types like 'trailer_watched'
}

export const logUserEvent = async (eventName: string, params: Record<string, any>) => {
  const user = auth.currentUser;
  const deviceId = navigator.userAgent;

  if (!user) {
    console.warn(`Event '${eventName}' not logged: User not authenticated.`);
    return; // Do not send event if user is not logged in
  }

  try {
    const idToken = await user.getIdToken();
    const deviceType = navigator.userAgent;

    const payload: LogEventPayload = {
      event: eventName,
      deviceType: deviceType,
    };

    if (eventName === 'watch_time') {
      const watchTimeSeconds = params.duration != null
        ? Math.floor(params.duration / 1000)
        : undefined;
      payload.movieId = params.movieId;
      payload.watchTimeSeconds = watchTimeSeconds;
      payload.movieName = params.movieName;
      payload.genre = params.genre;
      payload.publishDate = params.publishDate;
      payload.director = params.director;
      payload.eventType = params.eventType; // Assign eventType from params
    }

    // Add other event-specific parameters as needed
    if (eventName === 'search') {
      payload.searchTerm = params.searchTerm;
    }

    await axios.post<any, AxiosResponse<any>, LogEventPayload>(
      'http://localhost:2000/api/log-event',
      payload,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    console.log(`Event '${eventName}' logged successfully to Firestore.`);
  } catch (error) {
    console.error(`Failed to log event '${eventName}' to Firestore:`, error);
  }
};