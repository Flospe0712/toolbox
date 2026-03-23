// Common fetch pattern for YouTube tools
import fetchWithRetry, { FetchError, RateLimitError } from './fetchWithRetry';

/**
 * Execute a YouTube tool API request with proper error handling
 */
export async function toolFetch(endpoint, payload, { timeout = 10000, maxRetries = 2 } = {}) {
  try {
    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, {
      maxRetries,
      timeout,
      checkRateLimit: true
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    // Re-throw with proper error type
    if (err instanceof RateLimitError) {
      const error = new Error(`Rate limited. Please wait ${err.retryAfter} seconds.`);
      error.type = 'rate-limit';
      error.retryAfter = err.retryAfter;
      throw error;
    } else if (err instanceof FetchError && err.isTimeout) {
      const error = new Error('Request timed out. Please try again.');
      error.type = 'timeout';
      throw error;
    } else if (err instanceof FetchError) {
      const error = new Error(err.message || 'Network error');
      error.type = 'network';
      throw error;
    } else {
      throw err;
    }
  }
}

export default toolFetch;
