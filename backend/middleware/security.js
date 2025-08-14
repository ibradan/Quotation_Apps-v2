const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Rate limiting configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: message || 'Please try again later',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: message || 'Please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Security middleware configuration
const securityMiddleware = {
  // Basic rate limiting
  basicLimiter: createRateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP'), // 15 minutes, 100 requests
  
  // Strict rate limiting for sensitive endpoints
  strictLimiter: createRateLimit(15 * 60 * 1000, 5, 'Too many attempts, please try again later'), // 15 minutes, 5 requests
  
  // Login rate limiting
  loginLimiter: createRateLimit(15 * 60 * 1000, 5, 'Too many login attempts, please try again later'), // 15 minutes, 5 attempts
  
  // API rate limiting
  apiLimiter: createRateLimit(15 * 60 * 1000, 1000, 'API rate limit exceeded'), // 15 minutes, 1000 requests
  
  // File upload rate limiting
  uploadLimiter: createRateLimit(60 * 60 * 1000, 10, 'Too many file uploads'), // 1 hour, 10 uploads

  // Helmet configuration for security headers
  helmetConfig: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "ws:", "wss:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }),

  // CORS configuration
  corsConfig: cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:3000'
      ];
      
      // Add dynamic IP origins for mobile access
      const localIP = process.env.LOCAL_IP || '192.168.0.185';
      allowedOrigins.push(`http://${localIP}:5174`);
      allowedOrigins.push(`http://${localIP}:3000`);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name'
    ],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
  }),

  // Request validation middleware
  validateRequest: (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          message: error.details[0].message,
          details: error.details
        });
      }
      next();
    };
  },

  // Authentication middleware
  requireAuth: (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }
    
    // Add your JWT verification logic here
    // For now, we'll just check if token exists
    if (token === 'valid-token') {
      next();
    } else {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }
  },

  // Logging middleware
  requestLogger: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    
    next();
  },

  // Error handling middleware
  errorHandler: (err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: err.message
      });
    }
    
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token or no token provided'
      });
    }
    
    // Default error
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : err.message
    });
  }
};

module.exports = securityMiddleware; 