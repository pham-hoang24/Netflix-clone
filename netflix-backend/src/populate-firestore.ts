import { MediaService } from './services/MediaService';
import { testFirebaseConnection } from './dao/FirestoreDAO';
import { testTMDBConnection } from './dao/TMDBDAO';
import { getCategoriesSummary } from './dao/FirestoreDAO';

async function validateEnvironment(): Promise<void> {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY environment variable is required');
  }
  
  if (!process.env.FIREBASE_PROJECT_ID && !require('./serviceAccountKey.json')) {
    throw new Error('Firebase configuration is required (either serviceAccountKey.json or environment variables)');
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting Firestore population script...');
  
  try {
    // Validate environment and connections
    await validateEnvironment();
    await testFirebaseConnection();
    await testTMDBConnection();

    const mediaService = new MediaService();
    await mediaService.populateAllCategories();

    console.log('🎉 All categories populated successfully!');
    
    // Optional: Print summary
    const categoriesCount = await getCategoriesSummary();
    console.log(`📈 Summary: ${categoriesCount} categories created`);
    
  } catch (error: any) {
    console.error('💥 Error populating Firestore:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Script interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

