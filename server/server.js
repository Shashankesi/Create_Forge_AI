const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Validate Environment Variables on Startup
const validateEnvironment = () => {
  console.log(`
=====================================================
✦ CreateForge AI — AI Creative Workspace Server
🌐 Production Domain: https://createforgeai.tech
📡 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}
🚀 Environment: ${process.env.NODE_ENV || 'development'}
=====================================================`);

  const isMongoConfigured = Boolean(process.env.MONGODB_URI);
  console.log(`[Config] MongoDB: ${isMongoConfigured ? 'OK' : 'Using Local Fallback'}`);
  console.log(`[Config] Pollinations: OK (FLUX Model)`);
  
  const hasCloudinary = Boolean(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY));
  console.log(`[Config] Cloudinary: ${hasCloudinary ? 'OK (Active)' : 'Optional (Base64 storage active)'}`);

  if (process.env.GEMINI_API_KEY) {
    console.log('[Config] Gemini: OK');
  } else {
    console.warn('[Config] Gemini: Optional (Using Groq text fallback)');
  }

  const groqKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
  if (groqKey) {
    console.log('[Config] Groq: OK');
  } else {
    console.warn('[Config] Groq: Optional');
  }

  if (process.env.JWT_SECRET) {
    console.log('[Config] JWT Security: OK');
  }
};

validateEnvironment();

// Connect to Database & Start Server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`✨ CreateForge AI Server active on: http://localhost:${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
  });
});
