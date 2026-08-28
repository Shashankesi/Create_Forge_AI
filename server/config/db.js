const mongoose = require('mongoose');

// Cache the connection across calls
let isConnecting = false;

/**
 * Connect to MongoDB with single reusable connection
 */
const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return null;
  }

  isConnecting = true;
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/createforge_ai';
  const fallbackUri = 'mongodb://127.0.0.1:27017/createforge_ai';
  const dbName = process.env.MONGODB_DB_NAME || 'createforge_ai';

  try {
    const conn = await mongoose.connect(primaryUri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      autoIndex: true,
    });

    console.log(`✅ [MongoDB] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`);

    // Setup lifecycle event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MongoDB] Disconnected from database.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 [MongoDB] Reconnected to database.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ [MongoDB] Runtime connection error:', err.message);
    });

    isConnecting = false;
    return conn;
  } catch (primaryErr) {
    console.warn(`⚠️ [MongoDB] Primary connection attempt failed: ${primaryErr.message}`);

    if (primaryErr.message && primaryErr.message.includes('whitelist')) {
      console.warn('💡 [MongoDB Atlas Tip] Make sure your current IP address or 0.0.0.0/0 is whitelisted in MongoDB Atlas (Network Access -> IP Access List).');
    }

    if (primaryUri !== fallbackUri) {
      try {
        console.log('🔄 [MongoDB] Attempting fallback to local MongoDB instance...');
        const fallbackConn = await mongoose.connect(fallbackUri, {
          dbName,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          autoIndex: true,
        });
        console.log(`✅ [MongoDB] Connected successfully to fallback local host: ${fallbackConn.connection.host} (DB: ${fallbackConn.connection.name})`);
        isConnecting = false;
        return fallbackConn;
      } catch (fallbackErr) {
        console.error(`❌ [MongoDB] Fallback connection failed: ${fallbackErr.message}`);
      }
    }

    isConnecting = false;
    return null;
  }
};

const isDbConnected = () => Boolean(mongoose.connection && mongoose.connection.readyState === 1);

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;
