import { logEvent } from 'firebase/analytics';
import { auth, analytics } from './firebase';

export const logUserEvent = (eventName: string, params: Record<string, any>) => {
  const user = auth.currentUser;
  const deviceId = navigator.userAgent;

  logEvent(analytics, eventName, {
    ...params,
    user_id: user ? user.uid : 'unknown',
    device_id: deviceId,
    timestamp: new Date().toISOString(),
  });
};