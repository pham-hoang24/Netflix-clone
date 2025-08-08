import admin from 'firebase-admin';

export class AuthService {
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error: any) {
      console.error('Error verifying Firebase ID token:', error.message);
      throw new Error('Invalid or expired token');
    }
  }
}
