const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/swasthlink';
    console.log(`[DB] Attempting connection to MongoDB at: ${connUri}`);
    
    // Attempt standard connection with 2.5s timeout
    await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[DB] Successfully connected to MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[DB] Could not connect to primary MongoDB instance (${err.message}).`);
    console.log(`[DB] Starting fallback MongoMemoryServer for standalone execution...`);
    try {
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[DB] Connected to in-memory MongoDB instance at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[DB] Failed to start in-memory MongoDB server:', memErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
