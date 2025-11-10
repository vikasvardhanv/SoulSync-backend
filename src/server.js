import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLogger, errorLogger } from './middleware/logger.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'PRISMA_DATABASE_URL',
  'JWT_SECRET',
  // Cloudinary removed - no longer required
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  // Don't exit process in serverless environment, just log the error
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    process.exit(1);
  }
}

const app = express();

// Resolve __dirname for ES modules
const __dirname = path.resolve();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
  connectSrc: ["'self'", "https://api.soulsync.solutions", process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000']
    },
  },
}));

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
      'https://soulsync.solutions',
      'https://www.soulsync.solutions',
      'https://api.soulsync.solutions',
      // Allow localhost only in development
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:5173'] : [])
    ];
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Cache-Control']
}));

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware with proper error handling
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Handle payload too large errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Upload size too large',
      error: {
        type: 'PAYLOAD_TOO_LARGE',
        maxSize: '10MB',
        currentSize: req.headers['content-length'] ? `${Math.round(req.headers['content-length'] / (1024 * 1024))}MB` : 'unknown',
        suggestions: [
          'Compress your images before uploading',
          'Upload fewer photos at once (max 6)',
          'Use images under 2MB each for best results',
          'Ensure photos show your face clearly'
        ]
      }
    });
  }
  next(err);
});

// Compression middleware
app.use(compression());

// Production-optimized logging
if (process.env.NODE_ENV !== 'production') {
  console.info('🔰 Initializing SoulSync Backend');
  console.info('Environment:', process.env.NODE_ENV || 'development');
  console.info('API base routes will be mounted under /api');
}

// Request logging (only in development and staging)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Use enhanced API logging
app.use(apiLogger);

// Add error logging middleware (before error handlers)
app.use(errorLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SoulSync Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Alias health check under /api/health to support platforms that route under /api
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SoulSync Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'SoulSync Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      users: '/api/users',
      questions: '/api/questions',
      matches: '/api/matches',
      messages: '/api/messages',
      subscriptions: '/api/subscriptions',
      payments: '/api/payments',
      images: '/api/images'
    },
    documentation: 'https://github.com/your-username/soulsync-backend',
    timestamp: new Date().toISOString()
  });
});

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import questionRoutes from './routes/questions.js';
import matchRoutes from './routes/matches.js';
import messageRoutes from './routes/messages.js';
import subscriptionRoutes from './routes/subscriptions.js';
import paymentRoutes from './routes/payments.js';
import imageRoutes from './routes/images.js';
import notificationRoutes from './routes/notifications.js';
import locationRoutes from './routes/locations.js';

// Debug endpoint (only in non-production environments)
if (process.env.NODE_ENV !== 'production') {
  app.all('/api/debug', (req, res) => {
    res.json({
      success: true,
      message: 'Debug endpoint working',
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });
}

// API routes
app.use('/api/auth', authRoutes);
// Backward-compatible alias (without /api prefix) for legacy clients hitting /auth/*
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/locations', locationRoutes);

// Log mounted routes summary (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.info('📡 Mounted API routes:');
  console.info(' - /health, /api/health');
  console.info(' - /api/auth, /api/users, /api/questions');
  console.info(' - /api/matches, /api/messages');
  console.info(' - /api/subscriptions, /api/payments');
  console.info(' - /api/images, /api/notifications, /api/locations');
}

// Catch-all route for undefined endpoints
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: ['/health', '/api/*']
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start the server (only for local development, not during tests)
// Start server in all environments unless running tests or Vercel serverless
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`✅ SoulSync Backend server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🎉 API Base URL: http://localhost:${PORT}/api`);
    }
  });
}

// For Vercel serverless functions - initialize database connection
if (process.env.VERCEL) {
  // Ensure Prisma is connected in serverless environment
  import('./database/connection.js').then(() => {
    console.log('✅ Serverless database connection initialized');
  }).catch((error) => {
    console.error('❌ Serverless database connection failed:', error);
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;