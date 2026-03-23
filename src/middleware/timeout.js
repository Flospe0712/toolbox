/**
 * Request Timeout Middleware
 *
 * Enforces request timeouts globally or per-route to prevent hanging requests
 */

import { timeoutError } from './errorHandler.js';

/**
 * Create timeout middleware with configurable timeout duration
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000 = 30 seconds)
 * @returns {Function} Middleware function
 */
export function timeoutMiddleware(timeoutMs = 30000) {
  return (req, res, next) => {
    // Skip if response already sent
    if (res.headersSent) {
      return next();
    }

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.warn(
          `Request timeout (${timeoutMs}ms): ${req.method} ${req.path}`
        );
        res.status(408).json({
          error: `Request timeout after ${timeoutMs}ms`,
          status: 408,
          path: req.path,
          timestamp: new Date().toISOString(),
        });
      }
    }, timeoutMs);

    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    res.on('close', () => {
      clearTimeout(timeoutId);
    });

    // Call next middleware
    next();
  };
}

/**
 * Default timeout middleware (30 seconds for most endpoints)
 */
export const defaultTimeout = timeoutMiddleware(30000);

/**
 * Fast timeout middleware (5 seconds for quick endpoints)
 */
export const fastTimeout = timeoutMiddleware(5000);

/**
 * Slow timeout middleware (60 seconds for heavy operations)
 */
export const slowTimeout = timeoutMiddleware(60000);

/**
 * AI endpoints timeout middleware (10 seconds for Ollama)
 */
export const aiTimeout = timeoutMiddleware(10000);

/**
 * Image generation timeout middleware (15 seconds for Gemini)
 */
export const imageTimeout = timeoutMiddleware(15000);

/**
 * Helper to wrap Express async handlers with automatic error handling + timeout
 * @param {Function} handler - Async request handler
 * @param {number} timeoutMs - Optional timeout override
 * @returns {Function} Wrapped handler
 */
export function withTimeout(handler, timeoutMs = 30000) {
  return (req, res, next) => {
    // Apply timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.warn(
          `Route timeout (${timeoutMs}ms): ${req.method} ${req.path}`
        );
        res.status(408).json({
          error: `Operation took too long`,
          status: 408,
          path: req.path,
          timestamp: new Date().toISOString(),
        });
      }
    }, timeoutMs);

    // Clear timeout on response
    const cleanup = () => clearTimeout(timeoutId);
    res.on('finish', cleanup);
    res.on('close', cleanup);

    // Call handler with error handling
    Promise.resolve(handler(req, res, next))
      .catch((err) => {
        cleanup();
        next(err);
      });
  };
}
