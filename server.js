import express from 'express';
import cors from 'cors';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as ollamaService from './src/utils/ollamaService.js';
import * as geminiService from './src/utils/geminiService.js';
import { errorHandler, asyncHandler } from './src/middleware/errorHandler.js';
import { defaultTimeout, aiTimeout, imageTimeout, fastTimeout } from './src/middleware/timeout.js';
import * as fileWriter from './src/utils/fileWriter.js';
import youtubeRoutes from './api/youtube-routes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Apply default timeout middleware to all routes
app.use(defaultTimeout);

// Serve static files from dist/ WITHOUT auto-serving index.html
// (we'll handle SPA fallback with explicit wildcard route)
app.use(express.static('dist', { index: false }));

// API Routes MUST come before wildcard catchall
app.get('/api/tools', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'projects.json'), 'utf8');
    const parsed = JSON.parse(data);
    res.json(parsed.tools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'projects.json'), 'utf8');
    const parsed = JSON.parse(data);
    const tool = parsed.tools.find(t => t.id === req.params.id);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(tool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Endpoints
app.get('/api/ai/health', async (req, res) => {
  try {
    const ollamaHealth = await ollamaService.checkHealth();
    const geminiConfig = geminiService.checkConfiguration();
    res.json({
      status: 'ok',
      ollama: ollamaHealth,
      gemini: geminiConfig,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

app.post('/api/ai/suggest', async (req, res) => {
  try {
    const { topic, type } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!['text', 'color'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "text" or "color"' });
    }

    const suggestions = await ollamaService.generateSuggestions(topic, type);

    if (suggestions.length === 0) {
      return res.status(503).json({
        error: 'Ollama service unavailable or timeout',
        suggestions: [],
      });
    }

    res.json({ suggestions, type, topic });
  } catch (error) {
    console.error('Suggest endpoint error:', error);
    res.status(500).json({
      error: error.message,
      suggestions: [],
    });
  }
});

app.post('/api/ai/generate-image', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const result = await geminiService.generateBackgroundImage(topic);

    res.json({
      description: result.description,
      cost: result.cost,
      costStats: geminiService.getCostStats(),
      topic,
    });
  } catch (error) {
    console.error('Generate image endpoint error:', error);

    if (error.message.includes('not configured')) {
      return res.status(400).json({ error: error.message });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({ error: error.message });
    }

    if (error.message.includes('timeout')) {
      return res.status(408).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
});



// Project Management Endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const projectsDir = path.join(__dirname, 'data', 'projects');
    await fs.mkdir(projectsDir, { recursive: true });
    const files = await fs.readdir(projectsDir);
    const projects = [];
    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const data = await fs.readFile(path.join(projectsDir, file), 'utf8');
        const project = JSON.parse(data);
        projects.push({ id: project.id, name: project.name, createdAt: project.createdAt, updatedAt: project.updatedAt });
      } catch (e) {}
    }
    res.json(projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
  const projectId = `${Math.floor(Date.now() / 1000)}_${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();
  const project = {
    id: projectId,
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
    thumbnail: {
      selectedTemplate: 'gradient-dark',
      text: { headline: 'Amazing Video Title', subheadline: 'Catchy subtitle here', topic: 'trending topic' },
      colors: { headline: '#ffffff', subheadline: '#cbd5e1', topic: '#94a3b8', background: '#1e293b' }
    }
  };
  const projectsDir = path.join(__dirname, 'data', 'projects');
  await fs.mkdir(projectsDir, { recursive: true });
  const result = await fileWriter.atomicWriteJson(path.join(projectsDir, `${projectId}.json`), project);
  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }
  res.status(201).json(project);
}));

app.get('/api/projects/:id', async (req, res) => {
  try {
    const projectPath = path.join(__dirname, 'data', 'projects', `${req.params.id}.json`);
    const data = await fs.readFile(projectPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.put('/api/projects/:id', asyncHandler(async (req, res) => {
  const { id, name, thumbnail } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'Missing fields' });
  const projectsDir = path.join(__dirname, 'data', 'projects');
  await fs.mkdir(projectsDir, { recursive: true });
  const project = { id, name, createdAt: req.body.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(), thumbnail };
  const result = await fileWriter.atomicWriteJson(path.join(projectsDir, `${id}.json`), project);
  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }
  res.json(project);
}));

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projectPath = path.join(__dirname, 'data', 'projects', `${req.params.id}.json`);
    await fs.unlink(projectPath);
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: 'Not found' });
  }
});

// YouTube API Endpoints
app.post('/api/youtube/generate-script', asyncHandler(async (req, res) => {
  const { topic, style, length } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic required' });
  res.json({ 
    script: `[Stub] Generated script for "${topic}" (${style}, ${length}s)`,
    status: 'success'
  });
}));

app.post('/api/youtube/optimize-seo', asyncHandler(async (req, res) => {
  const { title, tags, description } = req.body;
  res.json({
    optimized: {
      title: title?.toUpperCase() || '[No title]',
      tags: tags || [],
      description: description || '[No description]'
    },
    score: 78,
    suggestions: ['Add 3-5 more tags', 'Include keywords in first 50 chars']
  });
}));

app.get('/api/youtube/analytics', asyncHandler(async (req, res) => {
  res.json({
    views: 1500,
    subscribers: 320,
    engagementRate: 8.5,
    topPerformingVideos: [],
    growthTrend: '+12% this month'
  });
}));

app.post('/api/youtube/generate-subtitles', asyncHandler(async (req, res) => {
  const { videoId, language } = req.body;
  res.json({
    subtitles: '[00:00] Stub subtitle...',
    language: language || 'en',
    videoId,
    status: 'generated'
  });
}));

app.post('/api/youtube/moderate-comments', asyncHandler(async (req, res) => {
  const { comments } = req.body;
  res.json({
    analyzed: comments?.length || 0,
    spam: 0,
    safe: comments?.length || 0,
    actions: ['approve', 'approve']
  });
}));

app.post('/api/youtube/manage-playlists', asyncHandler(async (req, res) => {
  const { action, playlistId } = req.body;
  res.json({
    action,
    playlistId,
    status: 'success',
    message: `Playlist ${action} completed`
  });
}));

app.post('/api/youtube/create-banner', asyncHandler(async (req, res) => {
  const { channelName, theme } = req.body;
  res.json({
    banner: '[Banner SVG/Canvas Data]',
    format: '2560x1440px',
    downloadUrl: '/api/download/banner-001',
    status: 'generated'
  });
}));

// Mount YouTube API routes
app.use('/api/youtube', youtubeRoutes);

// Wildcard SPA fallback route - MUST come AFTER all specific API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global error handler middleware - MUST come last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ToolBox running on http://localhost:${PORT}`);
});
