// youtube-routes.js - Express routes for YouTube features
import express from 'express';
import logger from './logger.js';
import { formatErrorResponse, YouTubeError } from './error-handler.js';
import YouTubeAPI from './youtube-api.js';
import ScriptGenerator from './script-generator.js';
import SEOOptimizer from './seo-optimizer.js';
import SubtitleGenerator from './subtitle-generator.js';
import CommentAI from './comment-ai.js';
import PlaylistManager from './playlist-manager.js';

const router = express.Router();

// Initialize services
const youtubeAPI = process.env.YOUTUBE_API_KEY ? 
  new YouTubeAPI(process.env.YOUTUBE_API_KEY) : null;

const scriptGen = process.env.CLAUDE_API_KEY ?
  new ScriptGenerator(process.env.CLAUDE_API_KEY) : null;

const seoOptimizer = new SEOOptimizer();
const subtitleGen = new SubtitleGenerator();
const commentAI = process.env.CLAUDE_API_KEY ?
  new CommentAI(process.env.CLAUDE_API_KEY) : null;

const playlistManager = youtubeAPI ?
  new PlaylistManager(youtubeAPI) : null;

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    services: {
      youtube_api: !!youtubeAPI,
      script_generator: !!scriptGen,
      comment_ai: !!commentAI,
      playlist_manager: !!playlistManager
    }
  });
});

// ============ ANALYTICS ============

// Get channel analytics
router.get('/analytics/channel/:channelId', async (req, res) => {
  try {
    if (!youtubeAPI) {
      return res.status(503).json({ error: 'YouTube API not configured' });
    }

    const analytics = await youtubeAPI.getChannelAnalytics(req.params.channelId);
    res.json(analytics);
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// Get video stats
router.get('/analytics/video/:videoId', async (req, res) => {
  try {
    if (!youtubeAPI) {
      return res.status(503).json({ error: 'YouTube API not configured' });
    }

    const stats = await youtubeAPI.getVideoStats(req.params.videoId);
    const seoAnalysis = await seoOptimizer.analyzeMetadata(stats);
    
    res.json({ ...stats, seo_analysis: seoAnalysis });
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// Get top videos
router.get('/analytics/top-videos/:channelId', async (req, res) => {
  try {
    if (!youtubeAPI) {
      return res.status(503).json({ error: 'YouTube API not configured' });
    }

    const limit = parseInt(req.query.limit) || 10;
    const videos = await youtubeAPI.getTopVideos(req.params.channelId, limit);
    res.json({ videos, count: videos.length });
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// ============ SCRIPT GENERATION ============

// Generate video script
router.post('/script/generate', async (req, res) => {
  try {
    if (!scriptGen) {
      return res.status(503).json({ error: 'Script generator not configured' });
    }

    const script = await scriptGen.generateScript(req.body);
    res.json(script);
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// Generate video title
router.post('/script/title', async (req, res) => {
  try {
    if (!scriptGen) {
      return res.status(503).json({ error: 'Script generator not configured' });
    }

    const { topic, audience } = req.body;
    const titles = await scriptGen.generateTitle(topic, audience);
    res.json(titles);
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// Generate video description
router.post('/script/description', async (req, res) => {
  try {
    if (!scriptGen) {
      return res.status(503).json({ error: 'Script generator not configured' });
    }

    const { title, script, tags } = req.body;
    const description = await scriptGen.generateDescription(title, script, tags);
    res.json({ description });
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// ============ SEO OPTIMIZATION ============

// Analyze video metadata
router.post('/seo/analyze', async (req, res) => {
  try {
    const analysis = await seoOptimizer.analyzeMetadata(req.body);
    res.json(analysis);
  } catch (err) {
    logger.error(err);
    res.status(500).json(formatErrorResponse(err));
  }
});

// Get keyword suggestions
router.post('/seo/keywords', async (req, res) => {
  try {
    const { topic, limit } = req.body;
    const keywords = await seoOptimizer.getKeywordSuggestions(topic, limit || 10);
    res.json(keywords);
  } catch (err) {
    logger.error(err);
    res.status(500).json(formatErrorResponse(err));
  }
});

// Get optimized hashtags
router.post('/seo/hashtags', (req, res) => {
  try {
    const { title, tags } = req.body;
    const hashtags = seoOptimizer.getOptimizedHashtags(title, tags);
    res.json(hashtags);
  } catch (err) {
    logger.error(err);
    res.status(500).json(formatErrorResponse(err));
  }
});

// ============ SUBTITLES ============

// Generate subtitles from audio
router.post('/subtitles/generate', async (req, res) => {
  try {
    const { audioUrl, language } = req.body;
    const subtitles = await subtitleGen.generateFromAudio(audioUrl, language);
    res.json(subtitles);
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// Format subtitles to SRT
router.post('/subtitles/format/srt', (req, res) => {
  try {
    const srt = subtitleGen.formatToSRT(req.body.subtitles || []);
    res.json({ format: 'srt', content: srt });
  } catch (err) {
    logger.error(err);
    res.status(500).json(formatErrorResponse(err));
  }
});

// Format subtitles to VTT
router.post('/subtitles/format/vtt', (req, res) => {
  try {
    const vtt = subtitleGen.formatToVTT(req.body.subtitles || []);
    res.json({ format: 'vtt', content: vtt });
  } catch (err) {
    logger.error(err);
    res.status(500).json(formatErrorResponse(err));
  }
});

// ============ COMMENTS ============

// Analyze comment
router.post('/comments/analyze', async (req, res) => {
  try {
    if (!commentAI) {
      return res.status(503).json({ error: 'Comment AI not configured' });
    }

    const analysis = await commentAI.analyzeComment(req.body.comment);
    res.json(analysis);
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// Generate reply to comment
router.post('/comments/reply', async (req, res) => {
  try {
    if (!commentAI) {
      return res.status(503).json({ error: 'Comment AI not configured' });
    }

    const reply = await commentAI.generateReply(req.body.comment, req.body.context);
    res.json(reply);
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// Detect spam
router.post('/comments/spam', (req, res) => {
  try {
    const spam = commentAI.detectSpam(req.body.comment);
    res.json(spam);
  } catch (err) {
    logger.error(err);
    res.status(500).json(formatErrorResponse(err));
  }
});

// Summarize comments
router.post('/comments/summary', (req, res) => {
  try {
    const summary = commentAI.summarizeComments(req.body.comments || []);
    res.json(summary);
  } catch (err) {
    logger.error(err);
    res.status(500).json(formatErrorResponse(err));
  }
});

// ============ PLAYLISTS ============

// Create playlist
router.post('/playlists', (req, res) => {
  try {
    if (!playlistManager) {
      return res.status(503).json({ error: 'Playlist manager not configured' });
    }

    const playlist = playlistManager.createPlaylist(req.body);
    res.status(201).json(playlist);
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// Get playlist
router.get('/playlists/:id', (req, res) => {
  try {
    if (!playlistManager) {
      return res.status(503).json({ error: 'Playlist manager not configured' });
    }

    const playlist = playlistManager.getPlaylist(req.params.id);
    res.json(playlist);
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// List playlists
router.get('/playlists', (req, res) => {
  try {
    if (!playlistManager) {
      return res.status(503).json({ error: 'Playlist manager not configured' });
    }

    const playlists = playlistManager.listPlaylists();
    res.json({ playlists, count: playlists.length });
  } catch (err) {
    logger.error(err);
    res.status(500).json(formatErrorResponse(err));
  }
});

// Add video to playlist
router.post('/playlists/:id/videos', (req, res) => {
  try {
    if (!playlistManager) {
      return res.status(503).json({ error: 'Playlist manager not configured' });
    }

    const playlist = playlistManager.addVideoToPlaylist(req.params.id, req.body.videoId);
    res.json(playlist);
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

// Delete playlist
router.delete('/playlists/:id', (req, res) => {
  try {
    if (!playlistManager) {
      return res.status(503).json({ error: 'Playlist manager not configured' });
    }

    const result = playlistManager.deletePlaylist(req.params.id);
    res.json(result);
  } catch (err) {
    logger.error(err);
    res.status(err.statusCode || 500).json(formatErrorResponse(err));
  }
});

export default router;
