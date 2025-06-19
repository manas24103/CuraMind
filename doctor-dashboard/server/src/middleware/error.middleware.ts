import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  code?: number;
  errors?: Record<string, { message: string }>;
}

const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error Handler:', err);

  // Default error status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorDetails: Record<string, any> | undefined;

  // Handle specific error types
  if (err.name === 'ValidationError' && 'errors' in err && err.errors) {
    statusCode = 400;
    const errors: Record<string, string> = {};
    Object.entries(err.errors as Record<string, { message?: string }>).forEach(([key, value]) => {
      errors[key] = value?.message || 'Invalid field';
    });
    message = 'Validation Error';
    errorDetails = { errors };
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
    errorDetails = { field: Object.keys((err as any).keyPattern || {})[0] };
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log the error for debugging
  console.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    status: statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
    ...(errorDetails && { details: errorDetails })
  });
};

// Export the error handler
export { errorHandler };
