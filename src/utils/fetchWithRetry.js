// Fetch with automatic retry and timeout handling
import { getRateLimiter } from './rateLimiter';

export class RateLimitError extends Error {
  constructor(retryAfter) {
    super(`Rate limited. Retry after ${retryAfter} seconds`);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class FetchError extends Error {
  constructor(message, statusCode, isTimeout = false) {
    super(message);
    this.name = 'FetchError';
    this.statusCode = statusCode;
    this.isTimeout = isTimeout;
  }
}

/**
 * Fetch with automatic retry, timeout, and rate limiting
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} timeout - Request timeout in milliseconds (default: 10000)
 * @param {boolean} checkRateLimit - Check rate limits (default: true)
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(
  url,
  options = {},
  {
    maxRetries = 3,
    timeout = 10000,
    checkRateLimit = true,
    retryDelay = 1000,
    backoffMultiplier = 1.5
  } = {}
) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check rate limiting
      let status = null;
      if (checkRateLimit) {
        const limiter = getRateLimiter(url);
        status = limiter.canMakeRequest();
        
        if (!status.allowed) {
          throw new RateLimitError(status.retryAfter);
        }
      }

      // Set up timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Make the request
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle rate limit response headers
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || status.retryAfter);
        throw new RateLimitError(retryAfter);
      }

      // Return successful responses
      if (response.ok) {
        return response;
      }

      // Retry on server errors
      if (response.status >= 500 && attempt < maxRetries) {
        lastError = new FetchError(
          `Server error: ${response.status}`,
          response.status,
          false
        );
        
        // Wait before retrying with exponential backoff
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Don't retry on client errors
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new FetchError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        false
      );
    } catch (err) {
      if (err.name === 'AbortError') {
        lastError = new FetchError('Request timed out', null, true);
      } else if (err instanceof RateLimitError) {
        throw err; // Don't retry rate limit errors
      } else if (err instanceof FetchError) {
        lastError = err;
      } else {
        lastError = new FetchError(err.message, null, false);
      }

      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export default fetchWithRetry;
