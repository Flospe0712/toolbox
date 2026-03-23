/**
 * Gemini Integration Service
 * Provides Google's Generative AI capabilities for image generation and analysis
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL_ID = 'gemini-1.5-flash';
const TIMEOUT_MS = 5000; // 5 second timeout for Gemini

// Cost tracking
const COST_PER_IMAGE = 0.0075; // ~$0.0075 per image generation (approximate)
let totalCost = 0;
let callCount = 0;

/**
 * Check if Gemini API key is configured
 * @returns {boolean} True if API key is available
 */
export function checkConfiguration() {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Generate a background image description using Gemini
 * Calls Google's Generative Language API
 * @param {string} topic - The topic for image generation
 * @returns {Promise<{description: string, cost: number}>} Image description and API cost
 * @throws {Error} If API key not configured or request fails
 */
export async function generateBackgroundImage(topic) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'Gemini API key not configured. Set GEMINI_API_KEY environment variable.'
    );
  }

  if (!topic || !topic.trim()) {
    throw new Error('Topic is required for image generation');
  }

  try {
    const prompt = generateImagePrompt(topic);

    const response = await fetch(
      `${GEMINI_API_BASE}/${MODEL_ID}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(
          'Gemini API rate limit exceeded. Please try again later.'
        );
      }
      if (response.status === 401) {
        throw new Error('Gemini API key invalid or expired');
      }
      throw new Error(
        `Gemini API error: ${response.status} ${errorData.error?.message || 'Unknown'}`
      );
    }

    const data = await response.json();
    const description = extractTextContent(data);

    // Track cost
    trackCost(topic);

    return {
      description,
      cost: COST_PER_IMAGE,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Gemini request timeout (5 seconds)');
    }
    throw error;
  }
}

/**
 * Generate a prompt for YouTube thumbnail background image
 * @param {string} topic - The topic to generate an image for
 * @returns {string} Formatted prompt for Gemini
 */
function generateImagePrompt(topic) {
  return `You are a professional thumbnail designer. Generate a detailed description of a visually striking YouTube thumbnail background image for the topic: "${topic}"

The description should:
1. Describe specific visual elements (shapes, patterns, textures)
2. Specify a color palette that would work well for this topic
3. Include composition guidance (rule of thirds, focus areas)
4. Be detailed enough to guide an image generation model
5. Be 2-3 sentences maximum

Remember: Thumbnails should be eye-catching, clear, and professional.`;
}

/**
 * Track API usage for cost monitoring
 * @param {string} topic - Topic that was processed
 */
export function trackCost(topic) {
  callCount++;
  totalCost += COST_PER_IMAGE;

  const timestamp = new Date().toISOString();
  console.log(
    `[Gemini API] Cost: $${COST_PER_IMAGE.toFixed(4)} | Total: $${totalCost.toFixed(2)} (${callCount} calls) | Topic: "${topic}" | Time: ${timestamp}`
  );

  // Alert if daily spend is high (prevent runaway costs)
  if (totalCost > 5.0) {
    console.warn(
      `[Gemini API] ⚠️  Daily spend exceeded $5.00. Current total: $${totalCost.toFixed(2)}`
    );
  }
}

/**
 * Get current cost tracking stats
 * @returns {Object} Cost tracking information
 */
export function getCostStats() {
  return {
    callCount,
    totalCost: parseFloat(totalCost.toFixed(2)),
    averageCostPerCall: callCount > 0 ? parseFloat((totalCost / callCount).toFixed(4)) : 0,
  };
}

/**
 * Reset cost tracking (for daily resets)
 */
export function resetCostTracking() {
  callCount = 0;
  totalCost = 0;
  console.log('[Gemini API] Cost tracking reset');
}

/**
 * Extract text content from Gemini API response
 * Handles nested response structure
 * @param {Object} data - Response from Gemini API
 * @returns {string} Extracted text content
 */
function extractTextContent(data) {
  try {
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      return data.candidates[0].content.parts[0].text;
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
  }

  throw new Error('Invalid response from Gemini API');
}

/**
 * Test endpoint: verify API key and connectivity
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function testConnection() {
  if (!process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'GEMINI_API_KEY not configured',
    };
  }

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/${MODEL_ID}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Say "OK" in one word.',
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(5000),
      }
    );

    return {
      success: response.ok,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
