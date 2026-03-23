// Retry manager for handling async operations with exponential backoff

export class RetryError extends Error {
  constructor(message, attempts, lastError) {
    super(message);
    this.name = 'RetryError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

/**
 * Execute an async function with automatic retry
 * @param {Function} fn - Async function to execute
 * @param {object} options - Retry options
 * @returns {Promise<any>} Result of the function
 */
export async function retry(
  fn,
  {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 1.5,
    shouldRetry = (error) => true,
    onRetry = null
  } = {}
) {
  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (!shouldRetry(error) || attempt === maxRetries) {
        throw new RetryError(
          `Failed after ${attempt + 1} attempts: ${error.message}`,
          attempt + 1,
          error
        );
      }

      // Call the onRetry callback
      if (onRetry) {
        onRetry({
          attempt: attempt + 1,
          maxRetries,
          error,
          nextRetryIn: delay
        });
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Create a retryable function
 * @param {Function} fn - The function to make retryable
 * @param {object} options - Retry options (same as retry function)
 * @returns {Function} Wrapped function that retries on failure
 */
export function createRetryable(fn, options = {}) {
  return async (...args) => {
    return retry(() => fn(...args), options);
  };
}

export default { retry, createRetryable, RetryError };
