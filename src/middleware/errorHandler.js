export const errorHandler = (err, req, res, next) => {
  try {
    // Sanitize headers to avoid logging secrets
    const safeHeaders = { ...req.headers };
    if (safeHeaders.authorization) safeHeaders.authorization = '[REDACTED]';
    if (safeHeaders.cookie) safeHeaders.cookie = '[REDACTED]';

    console.error('❌ Unhandled Error:', {
      message: err.message,
      name: err.name,
      path: req.originalUrl,
      method: req.method,
      status: err.status || null,
      headers: safeHeaders,
      body: req.body
    });
  } catch (logErr) {
    console.error('Error while logging errorHandler details:', logErr);
  }

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === '23505') { // PostgreSQL unique constraint violation
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.code === '23503') { // PostgreSQL foreign key constraint violation
    statusCode = 400;
    message = 'Invalid reference';
  } else if (err.code === '23514') { // PostgreSQL check constraint violation
    statusCode = 400;
    message = 'Invalid data provided';
  }

  const responsePayload = {
    success: false,
    message
  };

  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};

export const notFound = (req, res, next) => {
  console.warn(`⚠️  Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
}; 