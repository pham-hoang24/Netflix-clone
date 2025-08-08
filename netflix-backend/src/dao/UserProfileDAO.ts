import admin from 'firebase-admin';
import { UserProfile } from '../types/recommendation';

export class UserProfileDAO {
  private db: admin.firestore.Firestore;

  constructor(dbInstance: admin.firestore.Firestore) {
    this.db = dbInstance;
  }

  async createOrUpdateProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    const userRef = this.db.collection('users').doc(userId);
    
    await userRef.set({
      userId,
      ...profileData,
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const doc = await this.db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    
    const data = doc.data()!;
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastActiveAt: data.lastActiveAt?.toDate() || new Date(),
    } as UserProfile;
  }

  async updateViewingStats(userId: string, stats: Partial<UserProfile['viewingStats']>): Promise<void> {
    const userRef = this.db.collection('users').doc(userId);
    
    await userRef.update({
      viewingStats: stats,
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async getUsersByGenrePreference(genre: string, limit: number = 100): Promise<string[]> {
    const snapshot = await this.db.collection('users')
      .where('preferences.favoriteGenres', 'array-contains', genre)
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.id);
  }
}
