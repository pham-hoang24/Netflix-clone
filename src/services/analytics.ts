import { auth } from './firebase';
import axios from 'axios';

export const logUserEvent = async (eventName: string, params: Record<string, any>) => {
  const user = auth.currentUser;
  const deviceId = navigator.userAgent;

  if (!user) {
    console.warn(`Event '${eventName}' not logged: User not authenticated.`);
    return; // Do not send event if user is not logged in
  }

  try {
    const idToken = await user.getIdToken();
    await axios.post('http://localhost:2000/api/log-event', {
      event: eventName,
      params: {
        ...params,
        device_id: deviceId,
      },
    }, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    console.log(`Event '${eventName}' logged successfully to Firestore.`);
  } catch (error) {
    console.error(`Failed to log event '${eventName}' to Firestore:`, error);
  }
};