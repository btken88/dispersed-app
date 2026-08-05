const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Define secrets for 2nd Gen functions
const openweatherApiKey = defineSecret('OPENWEATHER_API_KEY');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Body parser middleware (with size limits)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// CORS - allow all origins for now, restrict in production
app.use(cors({ origin: true }));

// Import routes
const campsitesRouter = require('./routes/campsites');
const weatherRouter = require('./routes/weather');
const elevationRouter = require('./routes/elevation');
const photosRouter = require('./routes/photos');
const reviewsRouter = require('./routes/reviews');
const searchRouter = require('./routes/search');
const bugRouter = require('./routes/bug');

// Use routes
app.use('/api/campsites', campsitesRouter);
app.use('/api/campsites', photosRouter);
app.use('/api/campsites', reviewsRouter);
app.use('/api/search', searchRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/elevation', elevationRouter);
app.use('/api/bug', bugRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Dispersed API - Firebase Functions' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Export Express app as 2nd Gen Firebase Function
// Secrets will be available via process.env.OPENWEATHER_API_KEY
exports.api = onRequest(
  {
    secrets: [openweatherApiKey],
    region: 'us-central1',
    memory: '256MiB'
  },
  app
);
exports.db = db;
