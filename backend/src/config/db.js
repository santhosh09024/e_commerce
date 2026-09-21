const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to MongoDB at ${uri}: ${error.message}`);
    console.log('🔄 Initializing in-memory MongoDB fallback for instant local operation...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✅ Connected to In-Memory MongoDB: ${memUri}`);
      console.log('💡 Note: Data will be persisted while server runs. To use a permanent DB, start MongoDB locally or configure MONGO_URI in backend/.env');
    } catch (memError) {
      console.error(`❌ Critical database error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
