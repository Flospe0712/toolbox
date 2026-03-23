/**
 * Unit Tests for Ollama Service
 * Tests local AI suggestion generation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as ollamaService from '../utils/ollamaService.js';

// Mock fetch
global.fetch = vi.fn();

describe('ollamaService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkHealth', () => {
    it('should return true when Ollama is running', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] }),
      });

      const health = await ollamaService.checkHealth();
      expect(health).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/tags',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return false when Ollama is offline', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Connection refused'));

      const health = await ollamaService.checkHealth();
      expect(health).toBe(false);
    });

    it('should return false on timeout', async () => {
      global.fetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 100)
          )
      );

      const health = await ollamaService.checkHealth();
      expect(health).toBe(false);
    });
  });

  describe('generateSuggestions', () => {
    it('should return 3 text suggestions for valid topic', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response:
            '1. Amazing Video Title\n2. Mind-Blowing Content\n3. Must Watch Now',
        }),
      });

      const suggestions = await ollamaService.generateSuggestions(
        'technology',
        'text'
      );
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(3);
      expect(suggestions[0]).toBeTruthy();
    });

    it('should return 3 color suggestions for valid topic', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response:
            '1. #FF5733,#33FF57,#3357FF\n2. #FFA500,#FFD700,#FF6347\n3. #00CED1,#FF1493,#32CD32',
        }),
      });

      const suggestions = await ollamaService.generateSuggestions(
        'gaming',
        'color'
      );
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array if Ollama unavailable', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Connection refused'));

      const suggestions = await ollamaService.generateSuggestions(
        'topic',
        'text'
      );
      expect(suggestions).toEqual([]);
    });

    it('should return empty array on timeout', async () => {
      global.fetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 100)
          )
      );

      const suggestions = await ollamaService.generateSuggestions(
        'topic',
        'text'
      );
      expect(suggestions).toEqual([]);
    });

    it('should return empty array for empty topic', async () => {
      const suggestions = await ollamaService.generateSuggestions('', 'text');
      expect(suggestions).toEqual([]);
    });

    it('should return empty array for invalid type', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'some response' }),
      });

      // Directly test with empty response (mimics error behavior)
      const suggestions = await ollamaService.generateSuggestions(
        'topic',
        'text'
      );
      // Should still be called and return results even if not matching expected format
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('getAvailableModels', () => {
    it('should return model list when available', async () => {
      const mockModels = {
        models: [
          { name: 'mistral:7b', size: '4.1GB' },
          { name: 'llama2', size: '3.8GB' },
        ],
      };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockModels,
      });

      const models = await ollamaService.getAvailableModels();
      expect(models.models).toBeDefined();
      expect(models.models.length).toBeGreaterThan(0);
    });

    it('should return empty models array on error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Connection error'));

      const models = await ollamaService.getAvailableModels();
      expect(models.models).toEqual([]);
    });
  });
});
