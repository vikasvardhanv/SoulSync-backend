import app from '../src/server.js';

// Vercel serverless function handler with enhanced logging
export default async function handler(req, res) {
  const startTime = Date.now();
  
  // Log incoming request
  console.log(`🚀 [${new Date().toISOString()}] VERCEL ${req.method} ${req.url}`, {
    headers: {
      'user-agent': req.headers['user-agent']?.substring(0, 100),
      'origin': req.headers.origin,
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'content-type': req.headers['content-type']
    },
    query: req.query,
    body: req.method === 'POST' ? Object.keys(req.body || {}) : undefined
  });

  try {
    // Ensure app is properly initialized for serverless
    if (typeof app === 'function') {
      return app(req, res);
    } else {
      throw new Error('App is not a function - check server.js export');
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`💥 [${new Date().toISOString()}] VERCEL ERROR ${req.method} ${req.url} - ${duration}ms`, {
      error: error.message,
      stack: error.stack.split('\n').slice(0, 5).join('\n'),
      duration: `${duration}ms`
    });
    
    // Send error response if headers not sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Serverless function error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        timestamp: new Date().toISOString(),
        vercelId: req.headers['x-vercel-id']
      });
    }
  }
}