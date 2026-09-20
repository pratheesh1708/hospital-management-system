const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('./config/environment');
const db = require('./config/database');

const authRoutes = require('./routers/authRoutes');
const oauthRoutes = require('./routers/oauthRoutes');
const doctorRoutes = require('./routers/doctorRoutes');
const patientRoutes = require('./routers/patientRoutes');
const appointmentRoutes = require('./routers/appointmentRoutes');
const medicalRecordRoutes = require('./routers/medicalRecordRoutes');
const reportRoutes = require('./routers/reportRoutes');
const notificationRoutes = require('./routers/notificationRoutes');
const adminRoutes = require('./routers/adminRoutes');
const chatbotRoutes = require('./routers/chatbotRoutes');

const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration strictly allowing frontend with credentials/cookies
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === config.frontendUrl ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Cookie Parser for HttpOnly authentication cookies
app.use(cookieParser());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    databaseEngine: db.getActiveEngine(),
    environment: config.env
  });
});

// Lazy Database initialization for serverless / Vercel runtime
let isDbReady = false;
app.use(async (req, res, next) => {
  if (!isDbReady) {
    try {
      await db.initDatabase();
      isDbReady = true;
    } catch (err) {
      console.warn('DB initialization warning:', err.message);
    }
  }
  next();
});

// REST API Routers
app.use('/api/auth/oauth', oauthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatbotRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
