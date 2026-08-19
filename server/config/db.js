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

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3500,
      autoIndex: true,
    });

    console.log(`✅ [MongoDB] Connected successfully to host: ${conn.connection.host}`);
    isConnecting = false;
    return conn;
  } catch (primaryErr) {
    console.warn(`⚠️ [MongoDB] Primary connection attempt failed (${primaryErr.message})`);

    if (primaryUri !== fallbackUri) {
      try {
        console.log('🔄 [MongoDB] Attempting fallback to local MongoDB instance...');
        const fallbackConn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 3000,
          autoIndex: true,
        });
        console.log(`✅ [MongoDB] Connected successfully to fallback local host: ${fallbackConn.connection.host}`);
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
