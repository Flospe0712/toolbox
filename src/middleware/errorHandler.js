/**
 * Global Express Error Handler Middleware
 *
 * Catches all errors and returns consistent JSON responses with proper HTTP status codes
 */

/**
 * Error handler middleware
 * IMPORTANT: Must have 4 parameters (err, req, res, next) for Express to recognize it as error handler
 * @param {Error} err - The error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
export function errorHandler(err, req, res, next) {
  // Log error with timestamp
  const timestamp = new Date().toISOString();
  const statusCode = err.statusCode || err.status || 500;

  console.error(`[${timestamp}] Error (${statusCode}):`, {
    message: err.message,
    path: req.path,
    method: req.method,
    statusCode,
    ...(process.env.DEBUG === 'true' && { stack: err.stack }),
  });

  // Prepare error response
  const errorResponse = {
    error: err.message || 'Internal Server Error',
    status: statusCode,
    timestamp,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Send response with appropriate status code
  res.status(statusCode).json(errorResponse);
}

/**
 * Create a custom error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Error object with statusCode property
 */
export function createError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Async error wrapper - wraps async route handlers to catch errors
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped handler
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error handler
 * @param {string} message - Validation error message
 * @returns {Error} Error with 400 status
 */
export function validationError(message) {
  return createError(message, 400);
}

/**
 * Not found error handler
 * @param {string} resource - Resource name
 * @returns {Error} Error with 404 status
 */
export function notFoundError(resource = 'Resource') {
  return createError(`${resource} not found`, 404);
}

/**
 * Service unavailable error handler
 * @param {string} service - Service name
 * @returns {Error} Error with 503 status
 */
export function serviceUnavailableError(service = 'Service') {
  return createError(`${service} is currently unavailable`, 503);
}

/**
 * Timeout error handler
 * @returns {Error} Error with 408 status
 */
export function timeoutError() {
  return createError('Request timeout', 408);
}
