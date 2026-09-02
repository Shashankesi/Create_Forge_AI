const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const imageRoutes = require('./routes/imageRoutes');
const historyRoutes = require('./routes/historyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');
const brandRoutes = require('./routes/brandRoutes');
const canvasRoutes = require('./routes/canvasRoutes');
const briefRoutes = require('./routes/briefRoutes');
const researchRoutes = require('./routes/researchRoutes');
const versionRoutes = require('./routes/versionRoutes');
const exportRoutes = require('./routes/exportRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const moodboardRoutes = require('./routes/moodboardRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const multimodalRoutes = require('./routes/multimodalRoutes');
const commentRoutes = require('./routes/commentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Security & Cross-Origin Configuration
const allowedOrigins = [
  'https://createforgeai.tech',
  'https://www.createforgeai.tech',
  'https://create-forge-ai-1.onrender.com',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
];

if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.createforgeai.tech') ||
        origin.endsWith('.onrender.com') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

const cookieParser = require('cookie-parser');

// Express body & cookie parsers
app.use(cookieParser());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// General Rate Limiting
app.use('/api', generalLimiter);

// Root Redirect to Frontend
app.get('/', (req, res) => {
  const frontendUrl = process.env.CLIENT_URL || 'https://create-forge-ai-1.onrender.com';
  res.redirect(frontendUrl);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CreateForge AI API is operating normally.',
    product: 'CreateForge AI',
    domain: 'https://createforgeai.tech',
    tagline: 'Create. Refine. Transform.',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/canvas', canvasRoutes);
app.use('/api/briefs', briefRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/moodboard', moodboardRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/multimodal', multimodalRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/preferences', preferenceRoutes);

// Handle 404 for unhandled API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;
