# Phase 1: Podcast DB Schema + API Routes

---

## Ziel
Neue Supabase-Tabellen für Podcast-Episoden + CRUD API Routes im Shipyard-Pattern.

---

## Tasks

### 1.1 — Podcast DB Schema (Supabase Migration)
**Datei:** `supabase/podcast-schema.sql`

```sql
-- ============================================================================
-- PODCAST PIPELINE EXTENSION
-- Run after schema.sql in Supabase SQL Editor
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
  website         TEXT,
  instagram       TEXT DEFAULT '@florian_schoening',
  branding_json   JSONB DEFAULT '{}',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE podcast_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage podcast_config"
  ON podcast_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Podcast Episodes ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS podcast_episodes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT,
  title_en          TEXT,
  episode_number    INTEGER,
  status            TEXT NOT NULL DEFAULT 'uploaded'
                      CHECK (status IN ('uploaded','analyzing','analyzed','thumbnails_ready',
                                        'description_ready','subtitles_ready','ready','publishing','published')),
  
  -- Files
  video_path        TEXT,
  video_size        BIGINT,
  audio_path        TEXT,
  audio_size        BIGINT,
  transcript_path   TEXT,
  transcript_text   TEXT,
  transcript_format TEXT CHECK (transcript_format IN ('txt','srt','vtt')),

  -- AI Analysis
  analysis          JSONB,  -- {topic, summary_de, summary_en, keywords[], chapters[], guests[], mood, thumbnail_suggestions[]}

  -- Generated Content
  description       TEXT,
  description_en    TEXT,
  tags              TEXT[] DEFAULT '{}',
  seo_title         TEXT,
  youtube_category  TEXT DEFAULT '22',

  -- Subtitles
  subtitles_de_path TEXT,
  subtitles_en_path TEXT,

  -- Publishing
  youtube_video_id  TEXT,
  youtube_url       TEXT,
  youtube_published_at TIMESTAMPTZ,
  youtube_privacy   TEXT DEFAULT 'unlisted' CHECK (youtube_privacy IN ('public','unlisted','private','scheduled')),
  youtube_scheduled_at TIMESTAMPTZ,
  podcast_published BOOLEAN DEFAULT false,

  -- Thumbnail (reuses Shipyard's thumbnails table)
  chosen_thumbnail_id UUID REFERENCES thumbnails(id) ON DELETE SET NULL,

  -- Meta
  duration_seconds  NUMERIC,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage podcast_episodes"
  ON podcast_episodes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Episode Thumbnails (join, reuses thumbnails table) ───────────────────────

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
```

### 1.2 — TypeScript Types
**Datei:** `lib/types.ts` (ergänzen am Ende)

```typescript
// ── Podcast Pipeline ─────────────────────────────────────────────────────────

export type EpisodeStatus = 'uploaded' | 'analyzing' | 'analyzed' | 'thumbnails_ready' |
  'description_ready' | 'subtitles_ready' | 'ready' | 'publishing' | 'published'

export interface PodcastEpisode {
  id: string
  title: string | null
  title_en: string | null
  episode_number: number | null
  status: EpisodeStatus
  video_path: string | null
  audio_path: string | null
  transcript_text: string | null
  transcript_format: 'txt' | 'srt' | 'vtt' | null
  analysis: EpisodeAnalysis | null
  description: string | null
  tags: string[]
  seo_title: string | null
  subtitles_de_path: string | null
  subtitles_en_path: string | null
  youtube_video_id: string | null
  youtube_url: string | null
  youtube_privacy: string
  chosen_thumbnail_id: string | null
  podcast_published: boolean
  duration_seconds: number | null
  created_at: string
  updated_at: string
  episode_thumbnails?: EpisodeThumbnail[]
}

export interface EpisodeAnalysis {
  topic: string
  summary_de: string
  summary_en: string
  keywords: string[]
  chapters: { time: string; title: string }[]
  guests: string[]
  mood: string
  thumbnail_suggestions: string[]
}

export interface EpisodeThumbnail {
  id: string
  episode_id: string
  thumbnail_id: string
  variant: 'bold_text' | 'guest_focus' | 'topic_focus'
  is_chosen: boolean
  thumbnail?: Thumbnail
}

export interface PodcastConfig {
  id: string
  channel_id: string
  channel_name: string | null
  podcast_name: string | null
  description: string | null
  author: string | null
  instagram: string
  language: string
  category: string
  branding_json: Record<string, unknown>
}
```

### 1.3 — API Routes (CRUD)
Folge exakt Shipyard's Pattern: `createClient` mit service role, async params.

**Datei:** `app/api/podcast/episodes/route.ts`
- GET: Alle Episoden (mit episode_thumbnails + thumbnails)
- POST: Neue Episode erstellen (nach Upload)

**Datei:** `app/api/podcast/episodes/[id]/route.ts`
- GET: Einzelne Episode
- PATCH: Episode updaten (Status, Felder)
- DELETE: Episode löschen

**Datei:** `app/api/podcast/config/route.ts`
- GET: Podcast-Konfiguration
- PATCH: Config updaten

---

## Test-Kriterien
- [ ] Schema in Supabase ausgeführt (kein SQL Error)
- [ ] Types kompilieren (`npm run build` kein Fehler)
- [ ] GET /api/podcast/episodes → 200 (leeres Array)
- [ ] POST /api/podcast/episodes → 201 (Episode erstellt)
- [ ] PATCH /api/podcast/episodes/[id] → 200

## Commit
`feat(podcast): schema + CRUD API routes`
