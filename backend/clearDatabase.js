import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Url from './models/Url.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener');
    
    console.log('Connected to MongoDB');
    
    // Clear all URLs from the database
    const result = await Url.deleteMany({});
    console.log(`Cleared ${result.deletedCount} URLs from the database`);
    
    console.log('Database cleared successfully for fresh exam setup');
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
