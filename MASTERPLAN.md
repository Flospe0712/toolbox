# MASTERPLAN — Shipyard + YouTube Podcast Pipeline
## Für OpenClaw / GSD autonomes Coding

---

## Übersicht

Shipyard (Content Dashboard Template) auf dem VPS deployen und um eine
YouTube Video-Podcast Pipeline erweitern.

**Was Shipyard SCHON mitbringt:**
- YouTube Video-Pipeline (Ideas → Published)
- Thumbnail Studio (Upload, DALL-E, Rating, A/B)
- Video-Transkription (Upload + Segments)
- Beschreibungs-Generierung (Claude API)
- Asset Management (Title, Script, Description, Tags)
- Instagram + LinkedIn Content Management
- Analytics Dashboard + Competitor Tracking
- Content Calendar + Supabase DB mit Auth
- Dark Mode, Next.js 16, React 19, TypeScript

**Was wir HINZUFÜGEN:**
- Podcast Episode Management (Upload MP4+MP3+Transkript)
- Transkript → Thema-Erkennung (Haiku)
- 3x Thumbnail-Varianten + Vorschau-Player
- YouTube-Beschreibung Auto-Generator (SEO)
- Untertitel DE + EN
- YouTube Upload via API (OAuth2)
- Podcast RSS Feed (Apple/Spotify-konform)
- Kanal-Branding Auto-Fetch
- Step-by-Step Wizard

---

## Architektur

```
VPS (76.13.129.170)
├── Shipyard (Next.js 16)          → tools.assisstant.win
│   ├── Supabase Cloud (Free Tier) → Datenbank + Auth + Storage
│   ├── Anthropic API (Haiku)      → AI Features
│   ├── YouTube Data API v3        → Upload + Branding
│   └── Podcast RSS Endpoint       → Apple/Spotify Distribution
├── OpenClaw Gateway               → Telegram Bot
└── Cloudflare Tunnel              → HTTPS
```

---

## Kanal-Info

| Key | Value |
|-----|-------|
| Channel ID | UCRUfL9dUygCVbd7KgjwlIdw |
| Instagram | @florian_schoening |
| Format | Interview/Gespräch (2+ Personen) |
| Frequenz | Unregelmäßig |
| Podcast-Name | = YouTube-Kanalname (auto-fetch) |
| Branding | Auto-fetch via YouTube API |

---

## ⚠️ VOR DEM CODING — Manuelle Schritte (einmalig, ~20 Min)

### Schritt 1: Supabase Projekt erstellen (kostenlos)
1. Gehe zu https://supabase.com → Sign up / Login
2. "New Project" → Name: "Shipyard" → Region: eu-central-1
3. Warte bis Projekt ready ist (~2 Min)
4. Settings → API → Kopiere:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)
5. SQL Editor → Paste den Inhalt von supabase/schema.sql → Run
6. SQL Editor → Paste den Podcast-Schema-Erweiterung (wird erstellt) → Run
7. Authentication → URL Configuration:
   - Site URL: https://tools.assisstant.win
   - Redirect URLs: https://tools.assisstant.win/**

### Schritt 2: Google Cloud Projekt (für YouTube Upload)
1. https://console.cloud.google.com → Neues Projekt: "Shipyard"
2. APIs & Services → YouTube Data API v3 → Aktivieren
3. Anmeldedaten → OAuth 2.0 Client-ID → Webanwendung
4. Redirect URIs:
   - https://tools.assisstant.win/api/auth/youtube/callback
   - http://localhost:3000/api/auth/youtube/callback
5. Client-ID + Secret notieren

### Schritt 3: Anthropic API Key
- Bereits vorhanden (aus OpenClaw Setup)
- Gleicher Key für Shipyard

### Schritt 4: Mir die Keys geben
Poste mir (oder in .env.local):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
YOUTUBE_CLIENT_ID=xxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-...
```

---

## Phasen (7 Stück, alle autonom)

| # | Phase | ~Zeit | Abhängig von |
|---|-------|-------|-------------|
| 0 | Deploy Shipyard auf VPS | 15 min | Manuelle Schritte |
| 1 | Podcast DB Schema + API Routes | 25 min | Phase 0 |
| 2 | Upload + Transkript-Analyse | 25 min | Phase 1 |
| 3 | Thumbnails + Vorschau-Player | 25 min | Phase 2 |
| 4 | Beschreibung + SEO + Untertitel | 20 min | Phase 2 |
| 5 | YouTube OAuth2 + Upload | 25 min | Phase 4 |
| 6 | Podcast RSS + Distribution | 20 min | Phase 4 |
| 7 | Dashboard-Integration + Wizard | 25 min | Phase 1-6 |

**Gesamt: ~3h autonomes Coding**
