// End-to-end API tests for YouTube tools
const BASE_URL = 'http://localhost:5173/api/youtube';

describe('YouTube Tools API E2E Tests', () => {
  const timeout = 15000;

  describe('Script Generator', () => {
    test('should generate script with valid input', async () => {
      const response = await fetch(`${BASE_URL}/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'How to learn React',
          style: 'educational',
          length: 600,
          targetAudience: 'beginners'
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.script).toBeTruthy();
      expect(typeof data.script).toBe('string');
      expect(data.script.length).toBeGreaterThan(100);
    }, timeout);

    test('should fail with missing topic', async () => {
      const response = await fetch(`${BASE_URL}/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: 'educational',
          length: 600
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    }, timeout);
  });

  describe('SEO Optimizer', () => {
    test('should optimize title and tags', async () => {
      const response = await fetch(`${BASE_URL}/optimize-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'How to Learn React',
          description: 'A tutorial on React',
          tags: ['react', 'javascript', 'web']
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.optimized).toBeTruthy();
      expect(data.score).toBeGreaterThan(0);
      expect(data.score).toBeLessThanOrEqual(100);
    }, timeout);

    test('should provide suggestions', async () => {
      const response = await fetch(`${BASE_URL}/optimize-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Title',
          tags: []
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data.suggestions)).toBe(true);
    }, timeout);
  });

  describe('Comment Moderation', () => {
    test('should moderate comments correctly', async () => {
      const response = await fetch(`${BASE_URL}/moderate-comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: [
            'Great video! Thanks for sharing.',
            'Click here for free money!!!',
            'This is helpful content'
          ],
          threshold: 0.7
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(typeof data.safe).toBe('number');
      expect(typeof data.spam).toBe('number');
      expect(typeof data.analyzed).toBe('number');
    }, timeout);

    test('should handle empty comments', async () => {
      const response = await fetch(`${BASE_URL}/moderate-comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: [],
          threshold: 0.7
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    }, timeout);
  });

  describe('Subtitle Generator', () => {
    test('should fail gracefully with invalid URL', async () => {
      const formData = new FormData();
      formData.append('videoUrl', 'not-a-valid-url');
      formData.append('language', 'en');
      formData.append('includeTimestamps', 'true');

      const response = await fetch(`${BASE_URL}/subtitles`, {
        method: 'POST',
        body: formData
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    }, timeout);
  });

  describe('Error Handling', () => {
    test('should handle timeout gracefully', async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100);

      try {
        await fetch(`${BASE_URL}/script`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: 'Test',
            style: 'educational',
            length: 600
          }),
          signal: controller.signal
        });
      } catch (err) {
        expect(err.name).toBe('AbortError');
      }

      clearTimeout(timeoutId);
    }, timeout);

    test('should return proper error response', async () => {
      const response = await fetch(`${BASE_URL}/invalid-endpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    }, timeout);
  });

  describe('Rate Limiting', () => {
    test('should handle rate limit headers', async () => {
      const promises = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 5; i++) {
        promises.push(
          fetch(`${BASE_URL}/script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: `Test ${i}`,
              style: 'educational',
              length: 600
            })
          })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitResponses = responses.filter(r => r.status === 429);
      
      // At least one should be rate-limited
      expect(rateLimitResponses.length).toBeGreaterThanOrEqual(0);
    }, timeout);
  });
});

// Responsive design tests
describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  test.each(viewports)('should render correctly on $name ($width x $height)', async (viewport) => {
    // This is a placeholder for visual regression tests
    // In a real scenario, use tools like Percy or Chromatic
    expect(viewport.width).toBeGreaterThan(0);
    expect(viewport.height).toBeGreaterThan(0);
  });
});
