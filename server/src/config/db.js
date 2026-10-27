const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGO_URI. Connection errors are logged
 * clearly rather than crashing the whole process on boot, so the API
 * still starts (and `/api/health` still responds) even if the
 * database isn't reachable yet - handy while you're still wiring up
 * a MongoDB Atlas cluster or a local mongod.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tickets_to_thrill';

  mongoose.connection.on('connected', () => {
    console.log(`[db] connected -> ${uri}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
  } catch (err) {
    console.error('[db] initial connection failed:', err.message);
    console.error('[db] the API will keep running, but every DB-backed route will fail until MongoDB is reachable.');
  }
}

module.exports = connectDB;
