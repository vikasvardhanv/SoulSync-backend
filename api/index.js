import app from '../src/server.js';

// Enhanced request handler for Vercel serverless functions with logging
export default function handler(req, res) {
  const startTime = Date.now();
  
  // Enhanced logging for Vercel
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    headers: req.headers,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    origin: req.headers.origin,
    referer: req.headers.referer
  });

  // Override res.json and res.send to log responses
  const originalJson = res.json;
  const originalSend = res.send;
  
  res.json = function(data) {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Response ${res.statusCode} ${req.method} ${req.url} - ${duration}ms`, {
      statusCode: res.statusCode,
      responseSize: JSON.stringify(data).length,
      duration: `${duration}ms`
    });
    return originalJson.call(this, data);
  };
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Response ${res.statusCode} ${req.method} ${req.url} - ${duration}ms`, {
      statusCode: res.statusCode,
      responseSize: typeof data === 'string' ? data.length : JSON.stringify(data).length,
      duration: `${duration}ms`
    });
    return originalSend.call(this, data);
  };

  // Handle errors
  const originalOn = res.on || function() {};
  res.on = function(event, listener) {
    if (event === 'finish') {
      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Request completed ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms`);
    }
    return originalOn.call(this, event, listener);
  };

  try {
    return app(req, res);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Serverless function error:`, {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}