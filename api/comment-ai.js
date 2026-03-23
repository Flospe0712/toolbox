// comment-ai.js - YouTube comment analysis and response AI
import axios from 'axios';
import { withRetry, withTimeout } from './error-handler.js';
import logger from './logger.js';

class CommentAI {
  constructor(claudeApiKey) {
    this.apiKey = claudeApiKey;
    this.baseURL = 'https://api.anthropic.com/v1';
    this.model = 'claude-3-5-sonnet-20241022';
  }

  // Analyze comment sentiment and intent
  async analyzeComment(comment) {
    return withRetry(async () => {
      logger.info({ commentLength: comment.length }, 'Analyzing comment sentiment');

      const response = await withTimeout(
        axios.post(
          `${this.baseURL}/messages`,
          {
            model: this.model,
            max_tokens: 300,
            messages: [
              {
                role: 'user',
                content: `Analyze this YouTube comment and respond with JSON:
                Comment: "${comment}"
                
                Analyze:
                1. Sentiment: positive, neutral, negative, mixed
                2. Intent: question, feedback, spam, promotion, other
                3. Key topics mentioned
                4. Suggested response category: reply, escalate, ignore
                
                Format: {"sentiment":"...","intent":"...","topics":[...],"priority":"high/medium/low"}`
              }
            ]
          },
          {
            headers: {
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json'
            }
          }
        ),
        15000
      );

      try {
        const text = response.data.content[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        logger.warn('Comment analysis parsing failed');
        return { sentiment: 'unknown', intent: 'other', topics: [] };
      }
    });
  }

  // Generate AI response to comment
  async generateReply(comment, context = {}) {
    return withRetry(async () => {
      logger.info({ commentLength: comment.length }, 'Generating comment reply');

      const { videoTitle = '', channelName = '', tone = 'friendly' } = context;

      const response = await withTimeout(
        axios.post(
          `${this.baseURL}/messages`,
          {
            model: this.model,
            max_tokens: 400,
            messages: [
              {
                role: 'user',
                content: `Generate a helpful, engaging reply to this YouTube comment.
                
                Channel: ${channelName}
                Video: ${videoTitle}
                Tone: ${tone}
                
                Comment: "${comment}"
                
                Requirements:
                - Keep under 500 characters
                - Be authentic and genuine
                - Don't sound like a bot
                - Encourage engagement where appropriate
                - Use ${tone} tone
                
                Reply:`
              }
            ]
          },
          {
            headers: {
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json'
            }
          }
        ),
        15000
      );

      return {
        original_comment: comment,
        suggested_reply: response.data.content[0].text.trim(),
        tone,
        confidence: 0.9
      };
    });
  }

  // Detect spam/inappropriate comments
  async detectSpam(comment) {
    logger.info({ commentLength: comment.length }, 'Detecting spam');

    const spamIndicators = [];

    // Check for common spam patterns
    if (/(http|https):\/\//.test(comment)) spamIndicators.push('external_link');
    if (comment.length > 1000) spamIndicators.push('excessive_length');
    if (/\b(buy|click|visit|subscribe to my)\b/i.test(comment)) spamIndicators.push('promotional');
    if (/([\w])\1{3,}/.test(comment)) spamIndicators.push('repeated_chars');
    if (/[A-Z]{10,}/.test(comment)) spamIndicators.push('excessive_caps');

    return {
      isSpam: spamIndicators.length > 0,
      spamScore: Math.min(100, spamIndicators.length * 25),
      indicators: spamIndicators
    };
  }

  // Summarize comments for video
  async summarizeComments(comments = []) {
    if (comments.length === 0) {
      return { summary: 'No comments to analyze', topTopics: [] };
    }

    logger.info({ commentCount: comments.length }, 'Summarizing comments');

    // Simple topic extraction
    const words = comments
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4);

    const wordFreq = {};
    words.forEach(w => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });

    const topTopics = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, mentions: count }));

    return {
      totalComments: comments.length,
      topTopics,
      commonThemes: topTopics.map(t => t.word)
    };
  }
}

export default CommentAI;
