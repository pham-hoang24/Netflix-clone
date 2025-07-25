import { db } from './firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

export const getCategories = async () => {
  const categoriesCol = collection(db, 'categories');
  const categoriesSnapshot = await getDocs(categoriesCol);
  const categories = categoriesSnapshot.docs.map(doc => doc.data());
  return categories;
};

export const getMoviesForCategory = async (categoryName: string) => {
  const categoryDoc = doc(db, 'categories', categoryName);
  const categorySnapshot = await getDoc(categoryDoc);
  const categoryData = categorySnapshot.data();

  if (!categoryData) {
    return [];
  }

  const movieIds = categoryData.movies;
  const movies = [];

  for (const movieId of movieIds) {
    const movieDoc = doc(db, 'movies', movieId);
    const movieSnapshot = await getDoc(movieDoc);
    if (movieSnapshot.exists()) {
      movies.push(movieSnapshot.data());
    }
  }

  return movies;
};
