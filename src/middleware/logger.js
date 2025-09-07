// Enhanced logging middleware for SoulSync Backend
import morgan from 'morgan';

// Custom token for request body logging (for debugging)
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    // Only log non-sensitive data
    const body = { ...req.body };
    if (body.password) body.password = '[REDACTED]';
    if (body.currentPassword) body.currentPassword = '[REDACTED]';
    if (body.newPassword) body.newPassword = '[REDACTED]';
    return JSON.stringify(body);
  }
  return '';
});

// Custom token for error details
morgan.token('error', (req, res) => {
  return res.locals.error ? `Error: ${res.locals.error}` : '';
});

// Enhanced logging for API responses
export const apiLogger = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log incoming request with details
  console.log(`\n🔵 [${timestamp}] ${req.method} ${req.originalUrl}`, {
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']?.substring(0, 100),
    origin: req.headers.origin,
    contentType: req.headers['content-type'],
    authorization: req.headers.authorization ? 'Bearer [TOKEN]' : 'None',
    ...(process.env.NODE_ENV === 'development' && req.body && Object.keys(req.body).length > 0 && {
      body: (() => {
        const body = { ...req.body };
        // Redact sensitive fields
        if (body.password) body.password = '[REDACTED]';
        if (body.currentPassword) body.currentPassword = '[REDACTED]';
        if (body.newPassword) body.newPassword = '[REDACTED]';
        return body;
      })()
    })
  });

  // Store original json method
  const originalJson = res.json;
  
  // Override res.json to log API responses
  res.json = function(data) {
    const duration = Date.now() - startTime;
    const responseSize = JSON.stringify(data).length;
    
    // Log response based on status code
    if (res.statusCode >= 500) {
      console.error(`🔴 [${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        responseSize: `${responseSize} bytes`,
        error: data.message || data.error,
        ...(data.errors && { validationErrors: data.errors })
      });
    } else if (res.statusCode >= 400) {
      console.warn(`🟡 [${new Date().toISOString()}] CLIENT ERROR ${req.method} ${req.originalUrl}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        responseSize: `${responseSize} bytes`,
        message: data.message || data.error,
        ...(data.errors && { validationErrors: data.errors })
      });
    } else if (res.statusCode >= 200) {
      console.log(`🟢 [${new Date().toISOString()}] SUCCESS ${req.method} ${req.originalUrl}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        responseSize: `${responseSize} bytes`,
        ...(process.env.NODE_ENV === 'development' && data && {
          responsePreview: JSON.stringify(data).substring(0, 200)
        })
      });
    }
    
    return originalJson.call(this, data);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  console.error(`🚨 [${timestamp}] UNHANDLED ERROR ${req.method} ${req.originalUrl}`, {
    error: err.message,
    stack: err.stack,
    statusCode: err.status || err.statusCode || 500,
    ip: req.ip || req.headers['x-forwarded-for'],
    userAgent: req.headers['user-agent']?.substring(0, 100),
    ...(process.env.NODE_ENV === 'development' && req.body && {
      requestBody: (() => {
        const body = { ...req.body };
        if (body.password) body.password = '[REDACTED]';
        if (body.currentPassword) body.currentPassword = '[REDACTED]';
        if (body.newPassword) body.newPassword = '[REDACTED]';
        return body;
      })()
    })
  });
  
  // Store error for potential response logging
  res.locals.error = err.message;
  next(err);
};

// Database operation logger
export const dbLogger = (operation, table, details = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 [${new Date().toISOString()}] DB ${operation.toUpperCase()} ${table}`, details);
  }
};

// Authentication logger
export const authLogger = (event, userId, details = {}) => {
  console.log(`🔐 [${new Date().toISOString()}] AUTH ${event.toUpperCase()}`, {
    userId,
    ...details
  });
};

// File upload logger
export const uploadLogger = (event, details = {}) => {
  console.log(`📁 [${new Date().toISOString()}] UPLOAD ${event.toUpperCase()}`, details);
};

export default {
  apiLogger,
  errorLogger,
  dbLogger,
  authLogger,
  uploadLogger
};