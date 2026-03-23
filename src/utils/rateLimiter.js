// Rate limiter utility for managing API request throttling
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if a request can be made
   * @returns {object} { allowed: boolean, remaining: number, resetTime: number }
   */
  canMakeRequest() {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    const allowed = this.requests.length < this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - this.requests.length);
    const oldestRequest = this.requests[0];
    const resetTime = oldestRequest ? oldestRequest + this.windowMs : now;

    if (allowed) {
      this.requests.push(now);
    }

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000)
    };
  }

  /**
   * Get the current state without consuming a request
   */
  getStatus() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    const remaining = Math.max(0, this.maxRequests - this.requests.length);
    const oldestRequest = this.requests[0];
    const resetTime = oldestRequest ? oldestRequest + this.windowMs : now;

    return {
      remaining,
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000)
    };
  }

  reset() {
    this.requests = [];
  }
}

// Create per-endpoint rate limiters
const endpointLimiters = new Map();

export function getRateLimiter(endpoint, maxRequests = 10, windowMs = 60000) {
  if (!endpointLimiters.has(endpoint)) {
    endpointLimiters.set(endpoint, new RateLimiter(maxRequests, windowMs));
  }
  return endpointLimiters.get(endpoint);
}

export default RateLimiter;
