// playlist-manager.js - YouTube playlist management and curation
import { withRetry, withTimeout, YouTubeError } from './error-handler.js';
import logger from './logger.js';

class PlaylistManager {
  constructor(youtubeAPI) {
    this.youtube = youtubeAPI;
    this.playlists = new Map(); // In production, use database
  }

  // Create new playlist
  async createPlaylist(data = {}) {
    logger.info({ title: data.title }, 'Creating playlist');

    const {
      title = 'Untitled Playlist',
      description = '',
      privacy = 'private' // private, unlisted, public
    } = data;

    if (!title || title.length === 0) {
      throw new YouTubeError('Playlist title required', 400);
    }

    const playlist = {
      id: `playlist_${Date.now()}`,
      title,
      description,
      privacy,
      videos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.playlists.set(playlist.id, playlist);
    return playlist;
  }

  // Add video to playlist
  async addVideoToPlaylist(playlistId, videoId) {
    logger.info({ playlistId, videoId }, 'Adding video to playlist');

    const playlist = this.playlists.get(playlistId);
    if (!playlist) {
      throw new YouTubeError('Playlist not found', 404);
    }

    if (playlist.videos.includes(videoId)) {
      logger.warn('Video already in playlist');
      return playlist;
    }

    // Fetch video details
    const videoDetails = await withRetry(async () => {
      // In production, fetch from YouTube API
      return {
        id: videoId,
        title: 'Video Title',
        duration: 'PT10M30S'
      };
    });

    playlist.videos.push({
      videoId,
      addedAt: new Date().toISOString(),
      details: videoDetails
    });

    playlist.updatedAt = new Date().toISOString();
    return playlist;
  }

  // Remove video from playlist
  removeVideoFromPlaylist(playlistId, videoId) {
    logger.info({ playlistId, videoId }, 'Removing video from playlist');

    const playlist = this.playlists.get(playlistId);
    if (!playlist) {
      throw new YouTubeError('Playlist not found', 404);
    }

    playlist.videos = playlist.videos.filter(v => v.videoId !== videoId);
    playlist.updatedAt = new Date().toISOString();
    
    return playlist;
  }

  // Reorder videos in playlist
  reorderPlaylist(playlistId, newOrder) {
    logger.info({ playlistId, orderCount: newOrder.length }, 'Reordering playlist');

    const playlist = this.playlists.get(playlistId);
    if (!playlist) {
      throw new YouTubeError('Playlist not found', 404);
    }

    const reorderedVideos = newOrder
      .map(videoId => playlist.videos.find(v => v.videoId === videoId))
      .filter(v => v !== undefined);

    playlist.videos = reorderedVideos;
    playlist.updatedAt = new Date().toISOString();
    
    return playlist;
  }

  // Get playlist details
  getPlaylist(playlistId) {
    logger.info({ playlistId }, 'Getting playlist details');

    const playlist = this.playlists.get(playlistId);
    if (!playlist) {
      throw new YouTubeError('Playlist not found', 404);
    }

    return {
      ...playlist,
      videoCount: playlist.videos.length
    };
  }

  // List all playlists
  listPlaylists() {
    logger.info({ count: this.playlists.size }, 'Listing playlists');

    return Array.from(this.playlists.values()).map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      privacy: p.privacy,
      videoCount: p.videos.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
  }

  // Delete playlist
  deletePlaylist(playlistId) {
    logger.info({ playlistId }, 'Deleting playlist');

    if (!this.playlists.has(playlistId)) {
      throw new YouTubeError('Playlist not found', 404);
    }

    this.playlists.delete(playlistId);
    return { success: true, deletedId: playlistId };
  }

  // Generate playlist from theme/keyword
  async generatePlaylistFromTheme(theme, limit = 10) {
    logger.info({ theme, limit }, 'Generating playlist from theme');

    // Search videos by theme
    const videos = await withRetry(async () => {
      // In production, use YouTube API searchVideos
      return [
        { id: 'vid1', title: `${theme} - Part 1` },
        { id: 'vid2', title: `${theme} - Part 2` }
      ];
    });

    const playlist = {
      id: `theme_playlist_${Date.now()}`,
      title: `${theme} - Curated`,
      description: `Curated playlist about ${theme}`,
      privacy: 'private',
      videos: videos.slice(0, limit),
      createdAt: new Date().toISOString(),
      theme
    };

    this.playlists.set(playlist.id, playlist);
    return playlist;
  }

  // Export playlist as JSON
  exportPlaylist(playlistId) {
    logger.info({ playlistId }, 'Exporting playlist');

    const playlist = this.getPlaylist(playlistId);
    return {
      format: 'json',
      playlist,
      exportedAt: new Date().toISOString()
    };
  }

  // Get playlist statistics
  getPlaylistStats(playlistId) {
    logger.info({ playlistId }, 'Getting playlist stats');

    const playlist = this.getPlaylist(playlistId);

    return {
      playlistId,
      totalVideos: playlist.videos.length,
      createdAt: playlist.createdAt,
      lastUpdated: playlist.updatedAt,
      privacy: playlist.privacy
    };
  }
}

export default PlaylistManager;
