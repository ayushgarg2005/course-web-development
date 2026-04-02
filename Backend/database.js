import mongoose from 'mongoose';
import { MONGO_URI } from './config/config.js';

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in your .env file');
}

// Named connection — used by models as dbConnection.model(...)
const dbConnection = mongoose.createConnection(MONGO_URI);

dbConnection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

dbConnection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

dbConnection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

// Graceful shutdown on app termination
process.on('SIGINT', async () => {
  await dbConnection.close();
  console.log('MongoDB connection closed (app termination)');
  process.exit(0);
});

export { dbConnection };