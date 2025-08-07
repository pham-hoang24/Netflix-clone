import admin from 'firebase-admin';
import { StoredRecommendation } from '../types/recommendation';

export class RecommendationDAO {
  private db: admin.firestore.Firestore;

  constructor(dbInstance: admin.firestore.Firestore) {
    this.db = dbInstance;
  }

  async saveRecommendations(userId: string, recommendations: StoredRecommendation[]): Promise<void> {
    const userRecsRef = this.db.collection('users').doc(userId).collection('recommendations');
    
    // Clear existing recommendations for simplicity, or implement more complex merging
    const existingRecs = await userRecsRef.get();
    const batch = this.db.batch();
    existingRecs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Save new recommendations
    recommendations.forEach(rec => {
      const docRef = userRecsRef.doc(); // Firestore generates a unique ID
      batch.set(docRef, { ...rec, generatedAt: admin.firestore.FieldValue.serverTimestamp() });
    });

    await batch.commit();
  }

  async getRecommendations(userId: string, limit?: number): Promise<StoredRecommendation[] | null> {
    const userRecsRef = this.db.collection('users').doc(userId).collection('recommendations');
    let query: admin.firestore.Query = userRecsRef.orderBy('generatedAt', 'desc');

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      return null;
    }

    const recommendations: StoredRecommendation[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      recommendations.push({
        movieId: data.movieId,
        movieName: data.movieName || null,
        poster_path: data.poster_path || null,
        backdrop_path: data.backdrop_path || null,
        release_date: data.release_date || null,
        first_air_date: data.first_air_date || null,
        score: data.score || null,
        type: data.type || null,
        generatedAt: data.generatedAt?.toDate() || new Date(),
      });
    });
    return recommendations;
  }

  async deleteRecommendations(userId: string): Promise<void> {
    const userRecsRef = this.db.collection('users').doc(userId).collection('recommendations');
    const snapshot = await userRecsRef.get();
    const batch = this.db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
}
