// error-handler.js - YouTube API error handling & retry logic
import logger from './logger.js';

export class YouTubeError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = 'YouTubeError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Retry with exponential backoff
export async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries - 1) {
        logger.error({ attempt, error: err.message }, `Final attempt failed: ${err.message}`);
        throw err;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn({ attempt, delay, error: err.message }, `Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Error response formatter
export function formatErrorResponse(err) {
  const isYouTubeError = err instanceof YouTubeError;
  
  const response = {
    error: err.message,
    statusCode: isYouTubeError ? err.statusCode : 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(isYouTubeError && { details: err.details })
  };
  
  logger.error(response, `Error: ${err.message}`);
  return response;
}

// Timeout wrapper
export function withTimeout(promise, ms = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new YouTubeError(`Request timeout after ${ms}ms`, 504)), ms)
    )
  ]);
}

export default {
  YouTubeError,
  withRetry,
  withTimeout,
  formatErrorResponse
};
