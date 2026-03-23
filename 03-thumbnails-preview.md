# Phase 3: Thumbnails + Vorschau-Player

---

## Ziel
3 Thumbnail-Varianten generieren (nutzt Shipyard's thumbnails-System).
Vorschau-Player zeigt YouTube + Instagram Format. Wiederverwendbar.

---

## Tasks

### 3.1 — Thumbnail-Generierung API
**Datei:** `app/api/podcast/episodes/[id]/thumbnails/route.ts`

- POST: Generiert 3 Varianten
- Nutzt Anthropic SDK für Text-Vorschläge (bereits integriert)
- Optional: DALL-E für Hintergrund-Bilder (Shipyard hat OpenAI schon)
- 3 Varianten als Canvas/SVG → PNG → Supabase Storage (thumbnails bucket)
- Einträge in `thumbnails` + `episode_thumbnails` Tabellen
- Varianten: bold_text, guest_focus, topic_focus

**Wichtig:** Wiederverwendung von Shipyard's bestehendem Thumbnail-System!
- Speichere in `thumbnails` Tabelle (gleich wie Video-Thumbnails)
- Verknüpfe über `episode_thumbnails` Join-Tabelle
- `is_chosen` Flag für ausgewähltes Thumbnail

### 3.2 — Thumbnail-Generator Komponente
**Datei:** `components/podcast/thumbnail-generator.tsx`

- Zeigt 3 Varianten nebeneinander (Cards)
- Pro Variante: Titel editierbar, "Regenerieren" Button
- Radio-Select welches Thumbnail gewählt wird
- Nutze `ThumbnailModal` Pattern aus Shipyard für Vollbild-Ansicht
- Download-Button pro Variante

### 3.3 — Vorschau-Player Komponente
**Datei:** `components/podcast/preview-player.tsx`

- **YouTube-Vorschau:** Thumbnail + Titel + Channel-Name simuliert
  - Desktop + Mobile Toggle
- **Instagram-Vorschau:** 9:16 Crop
- Props: `mode="youtube" | "instagram" | "both"`
- Wiederverwendbar für Instagram Reels (spätere Integration)
- Side-by-Side Vergleich aller 3 Varianten

### 3.4 — Branding-Fetch Utility
**Datei:** `lib/youtube-branding.ts`

- Funktion `fetchChannelBranding(channelId)`:
  - YouTube Data API: `channels.list` (snippet, brandingSettings)
  - Kanal-Name, Logo, Banner-URL, Beschreibung
  - Ergebnis in `podcast_config` Tabelle cachen
- Fallback: Manuelle Eingabe wenn kein API Key

**Datei:** `app/api/podcast/branding/route.ts`
- GET: Holt Branding (aus Cache oder frisch von YouTube)
- POST: Erzwingt Refresh

---

## Test-Kriterien
- [ ] 3 Thumbnail-Varianten werden generiert (1280x720)
- [ ] Thumbnails in Supabase Storage gespeichert
- [ ] Vorschau-Player zeigt YouTube + Instagram Format
- [ ] Thumbnail-Auswahl speichert is_chosen korrekt
- [ ] Branding-Fetch holt Kanal-Daten (oder Fallback)

## Commit
`feat(podcast): thumbnail generation + preview player`
