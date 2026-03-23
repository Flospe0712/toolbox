// script-generator.js - YouTube script generation via Claude API
import axios from 'axios';
import { withRetry, withTimeout, YouTubeError } from './error-handler.js';
import logger from './logger.js';

class ScriptGenerator {
  constructor(claudeApiKey) {
    this.apiKey = claudeApiKey;
    this.baseURL = 'https://api.anthropic.com/v1';
    this.model = 'claude-3-5-sonnet-20241022';
  }

  async generateScript(options = {}) {
    const {
      topic = '',
      videoType = 'educational',  // educational, entertainment, vlog, tutorial
      duration = 600,  // seconds
      style = 'conversational',  // conversational, formal, comedic
      language = 'en'
    } = options;

    return withRetry(async () => {
      logger.info({ topic, videoType, duration, style }, 'Generating video script');

      const prompt = `
You are a professional YouTube video scriptwriter. Generate a video script with these specifications:
- Topic: ${topic}
- Video Type: ${videoType}
- Duration: ~${Math.round(duration / 60)} minutes (${duration} seconds, ~150 words/minute)
- Style: ${style}
- Language: ${language}

Requirements:
1. Start with a compelling hook (first 5 seconds)
2. Introduce the topic clearly
3. Break content into 3-5 main sections
4. Use natural transitions between sections
5. Include engaging examples or case studies
6. End with a call-to-action
7. Add [PAUSE] markers for natural breathing
8. Add [SHOW: graphic/footage] cues for visual elements

Format as a JSON object with:
{
  "title": "suggested video title",
  "thumbnail_ideas": ["idea1", "idea2", "idea3"],
  "script": "full script text with markup",
  "seo_tags": ["tag1", "tag2", ...],
  "duration_estimate": seconds,
  "key_sections": ["section1", "section2", ...]
}
`;

      const response = await withTimeout(
        axios.post(
          `${this.baseURL}/messages`,
          {
            model: this.model,
            max_tokens: 2000,
            messages: [
              {
                role: 'user',
                content: prompt
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
        30000
      );

      const scriptText = response.data.content[0].text;
      
      try {
        const jsonMatch = scriptText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : scriptText);
        logger.info({ topic }, 'Script generated successfully');
        return parsed;
      } catch (e) {
        logger.warn('Failed to parse structured response, returning raw text');
        return { script: scriptText, topic };
      }
    });
  }

  // Generate SEO-optimized title
  async generateTitle(topic, targetAudience = 'general') {
    return withRetry(async () => {
      logger.info({ topic, targetAudience }, 'Generating video title');

      const response = await withTimeout(
        axios.post(
          `${this.baseURL}/messages`,
          {
            model: this.model,
            max_tokens: 500,
            messages: [
              {
                role: 'user',
                content: `Generate 5 compelling YouTube video titles for: "${topic}". Target audience: ${targetAudience}. 
                Requirements:
                - Include relevant keywords naturally
                - Trigger curiosity (use power words)
                - Keep under 60 characters
                - Format as JSON: { "titles": ["title1", "title2", ...] }`
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
        logger.warn('Title generation parsing failed');
        return { titles: [topic] };
      }
    });
  }

  // Generate description
  async generateDescription(title, script, tags = []) {
    return withRetry(async () => {
      logger.info({ title }, 'Generating video description');

      const response = await withTimeout(
        axios.post(
          `${this.baseURL}/messages`,
          {
            model: this.model,
            max_tokens: 800,
            messages: [
              {
                role: 'user',
                content: `Generate a compelling YouTube video description for:
                Title: "${title}"
                Script summary: ${script.substring(0, 200)}...
                Tags: ${tags.join(', ')}
                
                Requirements:
                - 150-300 characters, engaging and SEO-friendly
                - First line is the hook
                - Include timestamps if applicable
                - Add call-to-action
                - Include relevant links placeholders`
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

      return response.data.content[0].text;
    });
  }
}

export default ScriptGenerator;
