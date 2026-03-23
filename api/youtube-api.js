// youtube-api.js - YouTube Data API v3 wrapper
import { google } from 'googleapis';
import { withRetry, withTimeout, YouTubeError } from './error-handler.js';
import logger from './logger.js';

class YouTubeAPI {
  constructor(apiKey, accessToken = null) {
    this.apiKey = apiKey;
    this.accessToken = accessToken;
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });
    this.youtubeAnalytics = google.youtubeAnalytics({
      version: 'v2',
      auth: accessToken || apiKey
    });
  }

  // Get channel analytics (views, engagement, etc.)
  async getChannelAnalytics(channelId, metrics = ['views', 'estimatedMinutesWatched', 'averageViewDuration']) {
    return withRetry(async () => {
      logger.info({ channelId, metrics }, 'Fetching channel analytics');
      
      const response = await withTimeout(
        this.youtubeAnalytics.reports.query({
          ids: `channel==${channelId}`,
          dimensions: 'day',
          metrics: metrics.join(','),
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        })
      );
      
      return response.data;
    });
  }

  // Get video details & stats
  async getVideoStats(videoId) {
    return withRetry(async () => {
      logger.info({ videoId }, 'Fetching video stats');
      
      const response = await withTimeout(
        this.youtube.videos.list({
          part: 'statistics,snippet,contentDetails',
          id: videoId,
          key: this.apiKey
        })
      );
      
      if (!response.data.items.length) {
        throw new YouTubeError(`Video ${videoId} not found`, 404);
      }
      
      return response.data.items[0];
    });
  }

  // Get top videos for channel
  async getTopVideos(channelId, limit = 10) {
    return withRetry(async () => {
      logger.info({ channelId, limit }, 'Fetching top videos');
      
      const response = await withTimeout(
        this.youtube.search.list({
          part: 'id,snippet',
          channelId,
          type: 'video',
          order: 'viewCount',
          maxResults: limit,
          key: this.apiKey
        })
      );
      
      return response.data.items || [];
    });
  }

  // Get playlists for channel
  async getPlaylists(channelId, limit = 50) {
    return withRetry(async () => {
      logger.info({ channelId }, 'Fetching playlists');
      
      const response = await withTimeout(
        this.youtube.playlists.list({
          part: 'snippet,contentDetails',
          channelId,
          maxResults: limit,
          key: this.apiKey
        })
      );
      
      return response.data.items || [];
    });
  }

  // Search videos by keyword
  async searchVideos(query, limit = 10, channelId = null) {
    return withRetry(async () => {
      logger.info({ query, channelId, limit }, 'Searching videos');
      
      const response = await withTimeout(
        this.youtube.search.list({
          part: 'id,snippet',
          q: query,
          type: 'video',
          maxResults: limit,
          channelId,
          key: this.apiKey
        })
      );
      
      return response.data.items || [];
    });
  }

  // Get video comments (first 100)
  async getVideoComments(videoId, limit = 100) {
    return withRetry(async () => {
      logger.info({ videoId, limit }, 'Fetching video comments');
      
      const response = await withTimeout(
        this.youtube.commentThreads.list({
          part: 'snippet',
          videoId,
          maxResults: Math.min(limit, 100),
          textFormat: 'plainText',
          key: this.apiKey
        })
      );
      
      return response.data.items || [];
    });
  }

  // Get trending videos
  async getTrendingVideos(regionCode = 'US', limit = 10) {
    return withRetry(async () => {
      logger.info({ regionCode, limit }, 'Fetching trending videos');
      
      const response = await withTimeout(
        this.youtube.videos.list({
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode,
          maxResults: limit,
          key: this.apiKey
        })
      );
      
      return response.data.items || [];
    });
  }
}

export default YouTubeAPI;
