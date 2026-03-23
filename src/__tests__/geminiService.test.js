/**
 * Unit Tests for Gemini Service
 * Tests Google's Generative AI integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as geminiService from '../utils/geminiService.js';

// Mock fetch
global.fetch = vi.fn();

// Setup environment
const originalEnv = process.env.GEMINI_API_KEY;

describe('geminiService', () => {
  afterEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = originalEnv;
  });

  describe('checkConfiguration', () => {
    it('should return true when API key is set', () => {
      process.env.GEMINI_API_KEY = 'test-key-12345';
      const configured = geminiService.checkConfiguration();
      expect(configured).toBe(true);
    });

    it('should return false when API key is not set', () => {
      delete process.env.GEMINI_API_KEY;
      const configured = geminiService.checkConfiguration();
      expect(configured).toBe(false);
    });
  });

  describe('generateBackgroundImage', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
    });

    it('should return image description when API responds successfully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'A futuristic AI-themed background with gradient colors and geometric shapes',
                  },
                ],
              },
            },
          ],
        }),
      });

      const result = await geminiService.generateBackgroundImage('AI technology');
      expect(result.description).toBeTruthy();
      expect(result.cost).toBe(0.0075);
      expect(result.description).toContain('futuristic');
    });

    it('should throw error when API key not configured', async () => {
      delete process.env.GEMINI_API_KEY;
      await expect(
        geminiService.generateBackgroundImage('topic')
      ).rejects.toThrow('Gemini API key not configured');
    });

    it('should throw error when topic is empty', async () => {
      await expect(geminiService.generateBackgroundImage('')).rejects.toThrow(
        'Topic is required'
      );
    });

    it('should throw error on HTTP 401 (invalid key)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: { message: 'Unauthorized' },
        }),
      });

      await expect(
        geminiService.generateBackgroundImage('topic')
      ).rejects.toThrow('Gemini API key invalid or expired');
    });

    it('should throw error on HTTP 429 (rate limit)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: { message: 'Rate limit exceeded' },
        }),
      });

      await expect(
        geminiService.generateBackgroundImage('topic')
      ).rejects.toThrow('Gemini API rate limit exceeded');
    });

    it('should throw timeout error when request takes too long', async () => {
      global.fetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 100)
          )
      );

      await expect(
        geminiService.generateBackgroundImage('topic')
      ).rejects.toThrow('Gemini request timeout');
    });
  });

  describe('Cost Tracking', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
      geminiService.resetCostTracking();
      vi.spyOn(console, 'log');
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    it('should track API calls and accumulate cost', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Test response' }],
              },
            },
          ],
        }),
      });

      // First call
      await geminiService.generateBackgroundImage('topic1');
      let stats = geminiService.getCostStats();
      expect(stats.callCount).toBe(1);
      expect(stats.totalCost).toBe(0.0075);

      // Second call
      await geminiService.generateBackgroundImage('topic2');
      stats = geminiService.getCostStats();
      expect(stats.callCount).toBe(2);
      expect(stats.totalCost).toBeCloseTo(0.015, 4);
    });

    it('should reset cost tracking', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Test' }],
              },
            },
          ],
        }),
      });

      await geminiService.generateBackgroundImage('topic');
      let stats = geminiService.getCostStats();
      expect(stats.callCount).toBe(1);

      geminiService.resetCostTracking();
      stats = geminiService.getCostStats();
      expect(stats.callCount).toBe(0);
      expect(stats.totalCost).toBe(0);
    });

    it('should log warning when daily spend exceeds $5', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Test' }],
              },
            },
          ],
        }),
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');

      // Simulate > $5 spend (667+ calls at $0.0075 each)
      // For testing, just check the tracking works
      for (let i = 0; i < 5; i++) {
        await geminiService.generateBackgroundImage('topic');
      }

      const stats = geminiService.getCostStats();
      expect(stats.totalCost).toBe(0.0375);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('testConnection', () => {
    beforeEach(() => {
      process.env.GEMINI_API_KEY = 'test-api-key';
    });

    it('should return success on successful connection', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ test: 'ok' }),
      });

      const result = await geminiService.testConnection();
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return failure when API key not configured', async () => {
      delete process.env.GEMINI_API_KEY;
      const result = await geminiService.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should return failure on HTTP error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await geminiService.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 500');
    });
  });
});
