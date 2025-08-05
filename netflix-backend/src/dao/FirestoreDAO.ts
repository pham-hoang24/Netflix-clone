import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { MovieDetails } from './TMDBDAO';

dotenv.config();

let initialized = false;
let _db: admin.firestore.Firestore;

export function initializeFirebase(): admin.firestore.Firestore {
  if (!initialized) {
    if (!admin.apps.length) {
      try {
        const serviceAccount = require('../serviceAccountKey.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: "netflix-clone-62aec",
        });
      } catch (error) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID!,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          }),
        });
      }
    }
    _db = admin.firestore();
    initialized = true;
  }
  return _db;
}

export const db = initializeFirebase();

export interface CategoryData {
  name: string;
  movies: string[];
}

export async function saveMovieDetailsToFirestore(movieDetails: MovieDetails): Promise<void> {
  try {
    await db.collection('movies').doc(String(movieDetails.id)).set(movieDetails);
  } catch (error: any) {
    console.error(`Error saving movie ${movieDetails.id} to Firestore:`, error.message);
    throw error;
  }
}

export async function saveCategoryDataToFirestore(categoryData: CategoryData): Promise<void> {
  try {
    await db.collection('categories').doc(categoryData.name).set(categoryData);
  } catch (error: any) {
    console.error(`Error saving category ${categoryData.name} to Firestore:`, error.message);
    throw error;
  }
}

export async function testFirebaseConnection(): Promise<void> {
  try {
    await db.collection('_test').limit(1).get();
    console.log('✅ Firebase connection successful');
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error.message);
    throw error;
  }
}

export async function getCategoriesSummary(): Promise<number> {
  try {
    const categoriesSnapshot = await db.collection('categories').get();
    return categoriesSnapshot.size;
  } catch (error: any) {
    console.error('Error getting categories summary:', error.message);
    throw error;
  }
}