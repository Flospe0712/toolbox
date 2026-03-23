/**
 * Ollama Integration Service
 * Provides local AI-powered text and color suggestions using Ollama
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'mistral:7b'; // Fast, 7B parameter model
const TIMEOUT_MS = 10000; // 10 second timeout for Ollama
const SUGGESTION_COUNT = 3; // Return 3 suggestions per request

/**
 * Check if Ollama service is available
 * @returns {Promise<boolean>} True if Ollama is running and accessible
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok;
  } catch (error) {
    console.error('Ollama health check failed:', error.message);
    return false;
  }
}

/**
 * Generate AI suggestions for text or color
 * @param {string} topic - The topic/subject for suggestions
 * @param {string} type - Type of suggestion: 'text' or 'color'
 * @returns {Promise<string[]>} Array of 3 suggestion strings, empty if error
 */
export async function generateSuggestions(topic, type = 'text') {
  if (!topic || !topic.trim()) {
    return [];
  }

  try {
    const prompt =
      type === 'text'
        ? generateTextPrompt(topic)
        : generateColorPrompt(topic);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        num_predict: 150, // Limit output length
        temperature: 0.7, // Balanced creativity
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(`Ollama request failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const suggestions = parseOllamaResponse(data.response, type);

    return suggestions.slice(0, SUGGESTION_COUNT);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Ollama request timeout');
    } else {
      console.warn('Ollama suggestion generation failed:', error.message);
    }
    return []; // Return empty array on any error (graceful fallback)
  }
}

/**
 * Generate prompt for text suggestions
 * Optimized for YouTube thumbnail headlines (CTR-focused)
 * @param {string} topic - The topic to generate suggestions for
 * @returns {string} Formatted prompt
 */
function generateTextPrompt(topic) {
  return `Generate exactly 3 short, attention-grabbing YouTube video headlines for the topic: "${topic}"

Requirements:
- Each headline should be 5-10 words maximum
- Focus on curiosity, emotion, or value proposition
- Use actionable words when possible
- Make them CTR-optimized for YouTube thumbnails

Format your response as a numbered list:
1. [headline 1]
2. [headline 2]
3. [headline 3]

Do not include explanations, only the headlines.`;
}

/**
 * Generate prompt for color suggestions
 * Optimized for thumbnail design
 * @param {string} topic - The topic to generate color suggestions for
 * @returns {string} Formatted prompt
 */
function generateColorPrompt(topic) {
  return `Generate 3 color palette suggestions for a YouTube thumbnail about: "${topic}"

Requirements:
- Each palette should have 2-3 main colors
- Colors should be complementary and visually appealing
- Consider the topic's mood and audience
- Format as hex codes

Format your response as a numbered list:
1. [hex1, hex2, hex3]
2. [hex1, hex2, hex3]
3. [hex1, hex2, hex3]

Do not include explanations, only the color codes.`;
}

/**
 * Parse Ollama response into structured suggestions
 * @param {string} response - Raw response from Ollama
 * @param {string} type - Type of suggestions ('text' or 'color')
 * @returns {string[]} Array of parsed suggestions
 */
function parseOllamaResponse(response, type) {
  const suggestions = [];

  // Split by numbered list markers (1., 2., 3., etc.)
  const lines = response.split('\n').filter((line) => line.trim());

  for (const line of lines) {
    const trimmed = line.replace(/^\d+\.\s*/, '').trim();
    if (trimmed && trimmed.length > 0) {
      if (type === 'color') {
        // Parse hex codes from color palettes
        const hexMatch = trimmed.match(/#[0-9A-Fa-f]{6}/g);
        if (hexMatch && hexMatch.length > 0) {
          suggestions.push(hexMatch.join(','));
        }
      } else {
        // For text, use the line as-is
        if (trimmed.length <= 100) {
          // Sanity check: headlines should be short
          suggestions.push(trimmed);
        }
      }
    }

    if (suggestions.length >= SUGGESTION_COUNT) {
      break;
    }
  }

  return suggestions;
}

/**
 * Get model info from Ollama
 * Useful for checking available models
 * @returns {Promise<Object>} Model list or error object
 */
export async function getAvailableModels() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch models:', error.message);
    return { models: [] };
  }
}
