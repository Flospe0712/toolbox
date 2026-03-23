// seo-optimizer.js - YouTube SEO optimization tools
import { withRetry, withTimeout, YouTubeError } from './error-handler.js';
import logger from './logger.js';

class SEOOptimizer {
  constructor() {
    this.commonTags = ['youtube', 'video', 'tutorial', 'how-to', 'tips', 'guide'];
  }

  // Analyze video metadata for SEO
  async analyzeMetadata(video) {
    logger.info({ videoId: video.id }, 'Analyzing SEO metadata');

    const {
      title = '',
      description = '',
      tags = [],
      statistics = {}
    } = video;

    const analysis = {
      title_score: this._scoreTitleSEO(title),
      description_score: this._scoreDescriptionSEO(description),
      tags_score: this._scoreTagsSEO(tags),
      engagement_ratio: this._calculateEngagementRatio(statistics),
      overall_seo_score: 0,
      recommendations: []
    };

    // Calculate overall score
    analysis.overall_seo_score = Math.round(
      (analysis.title_score + analysis.description_score + analysis.tags_score + analysis.engagement_ratio) / 4
    );

    // Generate recommendations
    analysis.recommendations = this._generateRecommendations(analysis);

    return analysis;
  }

  // Score title for SEO (0-100)
  _scoreTitleSEO(title) {
    let score = 50;

    // Length check (optimal: 50-70 chars)
    if (title.length >= 50 && title.length <= 70) score += 20;
    else if (title.length > 30) score += 10;

    // Check for power words
    const powerWords = ['how', 'best', 'top', 'ultimate', 'secret', 'proven', 'amazing'];
    if (powerWords.some(w => title.toLowerCase().includes(w))) score += 15;

    // Check for numbers (higher CTR)
    if (/\d+/.test(title)) score += 10;

    // Keyword in first 30%
    if (title.length > 0) {
      const firstThird = title.substring(0, Math.ceil(title.length / 3));
      if (firstThird.length > 3) score += 5;
    }

    return Math.min(100, score);
  }

  // Score description for SEO (0-100)
  _scoreDescriptionSEO(description) {
    let score = 50;

    // Length check (optimal: 150-300 chars)
    if (description.length >= 150 && description.length <= 300) score += 25;
    else if (description.length > 100) score += 15;

    // Check for links
    const linkPattern = /(https?:\/\/|www\.)/g;
    if (linkPattern.test(description)) score += 15;

    // Check for timestamps
    if (/\d{1,2}:\d{2}/.test(description)) score += 10;

    // Check for call-to-action
    const ctaWords = ['subscribe', 'like', 'comment', 'click', 'link'];
    if (ctaWords.some(w => description.toLowerCase().includes(w))) score += 10;

    return Math.min(100, score);
  }

  // Score tags for SEO (0-100)
  _scoreTagsSEO(tags) {
    let score = 50;

    // Number of tags (optimal: 5-15)
    if (tags.length >= 5 && tags.length <= 15) score += 25;
    else if (tags.length > 3) score += 15;

    // Tag relevance (average length check)
    const avgLength = tags.reduce((sum, tag) => sum + tag.length, 0) / (tags.length || 1);
    if (avgLength >= 3 && avgLength <= 20) score += 15;

    // Mix of broad and specific tags
    const hasShortTags = tags.some(t => t.length <= 5);
    const hasLongTags = tags.some(t => t.length > 10);
    if (hasShortTags && hasLongTags) score += 10;

    return Math.min(100, score);
  }

  // Calculate engagement ratio
  _calculateEngagementRatio(stats) {
    const { viewCount = 0, likeCount = 0, commentCount = 0 } = stats;
    
    if (viewCount === 0) return 0;
    
    const engagementRate = ((likeCount + commentCount) / viewCount) * 100;
    
    // Good engagement: 3-10%
    if (engagementRate >= 3 && engagementRate <= 10) return 100;
    if (engagementRate > 1) return 80;
    if (engagementRate > 0.5) return 60;
    return 40;
  }

  // Generate optimization recommendations
  _generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.title_score < 70) {
      recommendations.push({
        category: 'Title',
        priority: 'high',
        suggestion: 'Include power words and numbers. Aim for 50-70 characters.'
      });
    }

    if (analysis.description_score < 70) {
      recommendations.push({
        category: 'Description',
        priority: 'high',
        suggestion: 'Expand description to 150-300 chars. Add timestamps and CTA.'
      });
    }

    if (analysis.tags_score < 70) {
      recommendations.push({
        category: 'Tags',
        priority: 'medium',
        suggestion: 'Add 5-15 relevant tags. Mix broad and specific keywords.'
      });
    }

    if (analysis.engagement_ratio < 60) {
      recommendations.push({
        category: 'Engagement',
        priority: 'medium',
        suggestion: 'Encourage likes and comments in video. Better CTA needed.'
      });
    }

    return recommendations;
  }

  // Generate keyword suggestions for topic
  async getKeywordSuggestions(topic, limit = 10) {
    logger.info({ topic, limit }, 'Generating keyword suggestions');

    // Simple keyword expansion logic
    const keywords = [];
    const baseKeywords = topic.split(' ').filter(w => w.length > 3);

    // Add modifiers
    const modifiers = ['best', 'how to', 'tutorial', 'guide', 'tips', 'advanced'];
    
    modifiers.forEach(modifier => {
      keywords.push(`${modifier} ${topic}`);
      baseKeywords.forEach(bk => {
        keywords.push(`${modifier} ${bk}`);
      });
    });

    return {
      topic,
      keywords: keywords.slice(0, limit),
      search_volume_estimate: 'medium',
      competition: 'medium-high',
      generated_at: new Date().toISOString()
    };
  }

  // Optimize hashtags
  getOptimizedHashtags(title, tags = []) {
    const hashtags = new Set();

    // From title
    title.split(' ').forEach(word => {
      if (word.length > 3) hashtags.add('#' + word.toLowerCase());
    });

    // From tags
    tags.slice(0, 5).forEach(tag => {
      hashtags.add('#' + tag.replace(/\s+/g, '').toLowerCase());
    });

    return {
      hashtags: Array.from(hashtags).slice(0, 10),
      recommended_count: 5,
      placement: 'description or first comment'
    };
  }
}

export default SEOOptimizer;
