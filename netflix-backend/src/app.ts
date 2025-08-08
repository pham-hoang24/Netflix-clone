import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { testFirebaseConnection, initializeFirebase } from './dao/FirestoreDAO';
import { testTMDBConnection } from './dao/TMDBDAO';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2000;

// Initialize Firebase and get the db instance
const db = initializeFirebase();

// Global Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes(db)); // Pass db to routes

// Error handling middleware (optional, but good practice)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Perform connection tests on startup
  console.log('Testing external connections...');
  try {
    await testFirebaseConnection();
    await testTMDBConnection();
    console.log('All external connections are healthy.');
  } catch (error) {
    console.error('One or more external connections failed:', error);
    // Depending on criticality, you might want to exit here: process.exit(1);
  }
});