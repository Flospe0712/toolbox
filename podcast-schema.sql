-- ============================================================================
-- PODCAST PIPELINE EXTENSION FOR SHIPYARD
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================================

-- ── Podcast Config ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS podcast_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id      TEXT NOT NULL DEFAULT 'UCRUfL9dUygCVbd7KgjwlIdw',
  channel_name    TEXT,
  channel_logo    TEXT,
  podcast_name    TEXT,
  description     TEXT,
  author          TEXT,
  email           TEXT,
  language        TEXT DEFAULT 'de',
  category        TEXT DEFAULT 'Society & Culture',
  subcategory     TEXT DEFAULT 'Personal Journals',
  explicit        BOOLEAN DEFAULT false,
  website         TEXT DEFAULT 'https://www.youtube.com/channel/UCRUfL9dUygCVbd7KgjwlIdw',
  instagram       TEXT DEFAULT '@florian_schoening',
  branding_json   JSONB DEFAULT '{}',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE podcast_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage podcast_config"
  ON podcast_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default config row
INSERT INTO podcast_config (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- ── Podcast Episodes ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS podcast_episodes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT,
  title_en          TEXT,
  episode_number    INTEGER,
  status            TEXT NOT NULL DEFAULT 'uploaded'
                      CHECK (status IN ('uploaded','analyzing','analyzed','thumbnails_ready',
                                        'description_ready','subtitles_ready','ready','publishing','published')),

  -- Files (Supabase Storage paths)
  video_path        TEXT,
  video_size        BIGINT,
  audio_path        TEXT,
  audio_size        BIGINT,
  transcript_path   TEXT,
  transcript_text   TEXT,
  transcript_format TEXT CHECK (transcript_format IN ('txt','srt','vtt')),

  -- AI Analysis (JSON)
  analysis          JSONB,

  -- Generated Content
  description       TEXT,
  description_en    TEXT,
  tags              TEXT[] DEFAULT '{}',
  seo_title         TEXT,
  youtube_category  TEXT DEFAULT '22',

  -- Subtitles (Supabase Storage paths)
  subtitles_de_path TEXT,
  subtitles_en_path TEXT,

  -- YouTube Publishing
  youtube_video_id  TEXT,
  youtube_url       TEXT,
  youtube_published_at TIMESTAMPTZ,
  youtube_privacy   TEXT DEFAULT 'unlisted' CHECK (youtube_privacy IN ('public','unlisted','private','scheduled')),
  youtube_scheduled_at TIMESTAMPTZ,

  -- Podcast Publishing
  podcast_published BOOLEAN DEFAULT false,

  -- Thumbnail (references existing thumbnails table)
  chosen_thumbnail_id UUID REFERENCES thumbnails(id) ON DELETE SET NULL,

  -- Meta
  duration_seconds  NUMERIC,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage podcast_episodes"
  ON podcast_episodes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Episode Thumbnails (join table, reuses existing thumbnails) ──────────────

CREATE TABLE IF NOT EXISTS episode_thumbnails (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  thumbnail_id  UUID NOT NULL REFERENCES thumbnails(id) ON DELETE CASCADE,
  variant       TEXT CHECK (variant IN ('bold_text','guest_focus','topic_focus')),
  is_chosen     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(episode_id, thumbnail_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_episode_thumbnails_one_chosen
  ON episode_thumbnails(episode_id) WHERE is_chosen = TRUE;
CREATE INDEX IF NOT EXISTS idx_episode_thumbnails_episode ON episode_thumbnails(episode_id);

ALTER TABLE episode_thumbnails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage episode_thumbnails"
  ON episode_thumbnails FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── YouTube OAuth Tokens ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS youtube_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token    TEXT NOT NULL,
  refresh_token   TEXT NOT NULL,
  token_type      TEXT DEFAULT 'Bearer',
  expiry_date     BIGINT,
  scope           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE youtube_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage youtube_tokens"
  ON youtube_tokens FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Triggers ─────────────────────────────────────────────────────────────────

CREATE TRIGGER update_podcast_episodes_updated_at
  BEFORE UPDATE ON podcast_episodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcast_config_updated_at
  BEFORE UPDATE ON podcast_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Storage Buckets (run via Supabase Dashboard or API) ──────────────────────
-- NOTE: These need to be created via Supabase Dashboard > Storage:
-- 1. podcast-videos (Private, 2GB max)
-- 2. podcast-audio (Public, 500MB max)
-- 3. podcast-subtitles (Public, 10MB max)
-- The existing "thumbnails" bucket can be reused for episode thumbnails.
