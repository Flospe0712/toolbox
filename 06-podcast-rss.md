# Phase 6: Podcast RSS Feed + Distribution

---

## Ziel
Apple/Spotify-konformen RSS Feed generieren. MP3 über Supabase Storage public zugänglich.

---

## Tasks

### 6.1 — RSS Feed Endpoint
**Dependencies:** `npm install rss`
**Datei:** `app/api/podcast/rss/route.ts`

- GET: Liefert XML RSS Feed
- Content-Type: `application/rss+xml`
- Kein Auth nötig (public endpoint)
- iTunes + Podcast Index Namespace Tags
- Feed-URL: `https://tools.assisstant.win/api/podcast/rss`
- Episoden: Alle mit status "published" + podcast_published=true
- MP3-URL: Supabase Storage Public URL
- Thumbnails: Supabase Storage Public URL
- Kapitelmarken in `<content:encoded>` als HTML

### 6.2 — RSS Feed Generator Utility
**Datei:** `lib/podcast-rss.ts`

- Funktion `generatePodcastFeed(config, episodes)`
- Apple Podcast Spezifikation (alle iTunes Tags)
- Spotify-kompatibel (gleiche Spec)
- Duration Format: HH:MM:SS
- Episode GUID: Episode-ID (stabil, nie ändern)
- pubDate: RFC 2822 Format

### 6.3 — Podcast Publish API
**Datei:** `app/api/podcast/episodes/[id]/publish/podcast/route.ts`

- POST: Markiert Episode als podcast_published=true
- Prüft ob MP3 public zugänglich ist
- Prüft ob Beschreibung vorhanden
- Episode erscheint dann automatisch im RSS Feed

### 6.4 — Podcast-Distributor Komponente
**Datei:** `components/podcast/podcast-distributor.tsx`

- RSS Feed URL prominent (Copy Button)
- Feed-Validierung (Prüfung der XML-Struktur)
- Plattform-Links mit Status:
  - Spotify for Podcasters → https://podcasters.spotify.com
  - Apple Podcasts Connect → https://podcastsconnect.apple.com
  - Amazon Music → https://podcasters.amazon.com
  - Pocket Casts → submit.pocketcasts.com
- Pro Plattform: Status (Not Submitted / Pending / Active)
- Manuelle Status-Toggle (User markiert wenn eingereicht)
- Letzte veröffentlichte Episode im Feed anzeigen

### 6.5 — Podcast Config Seite
**Datei:** `components/podcast/podcast-settings.tsx`

- Podcast-Name, Beschreibung, Autor
- Kategorie + Subkategorie (Apple Podcast Taxonomy)
- Sprache
- Explicit Flag
- Cover-Bild (Kanal-Logo oder Custom)
- RSS Feed URL
- Alle Social Links

---

## Test-Kriterien
- [ ] GET /api/podcast/rss → Valides XML
- [ ] iTunes-Tags vollständig vorhanden
- [ ] MP3-URL im Feed ist erreichbar
- [ ] Feed-Validierung besteht (Cast Feed Validator Pattern)
- [ ] Plattform-Links korrekt

## Commit
`feat(podcast): RSS feed + podcast distribution`
