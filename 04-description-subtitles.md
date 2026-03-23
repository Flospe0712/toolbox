# Phase 4: Beschreibung + SEO + Untertitel

---

## Ziel
YouTube-Beschreibung generieren (SEO-optimiert), Tags, Untertitel DE + EN.

---

## Tasks

### 4.1 — Beschreibungs-Generator API
**Datei:** `app/api/podcast/episodes/[id]/description/route.ts`

- POST: Haiku generiert YouTube-Beschreibung
- Input: analysis (topic, summary, keywords, chapters, guests)
- Output: Fertige Beschreibung mit Kapitelmarken, Social Links, CTA
- Beschreibungs-Template in podcast_config (Social Links, CTA)
- Max 5000 Zeichen (YouTube Limit)
- Status → "description_ready"

### 4.2 — SEO Tag Generator
**Datei:** `app/api/podcast/episodes/[id]/seo/route.ts`

- POST: Haiku generiert Tags + optimierten Titel
- YouTube Tags: Max 500 Zeichen, 15-25 Tags
- Optimierter Titel: Max 100 Zeichen
- Ergebnis in episode.tags[] + episode.seo_title

### 4.3 — Untertitel-Generator API
**Datei:** `app/api/podcast/episodes/[id]/subtitles/route.ts`

- POST: Generiert DE + EN Untertitel
- Wenn TXT: Haiku segmentiert in ~5s Blöcke (geschätzte Timestamps)
- Wenn SRT: Timestamps beibehalten, Text bereinigen
- EN: Haiku übersetzt chunk-weise (50 Blöcke/Call)
- SRT-Format: Max 42 chars/Zeile, max 2 Zeilen
- Upload zu Supabase Storage (podcast-subtitles Bucket)
- Status → "subtitles_ready"

### 4.4 — Beschreibungs-Editor Komponente
**Datei:** `components/podcast/description-editor.tsx`

- Generierte Beschreibung in Textarea (editierbar)
- Live-Zeichenzähler (5000 max)
- Kapitelmarken separat editierbar
- Tags als Chip-Editor (add/remove)
- SEO-Titel editierbar
- "Regenerieren" + "Kopieren" Buttons
- YouTube-Vorschau (collapsed/expanded)

### 4.5 — Untertitel-Manager Komponente
**Datei:** `components/podcast/subtitle-manager.tsx`

- Tab: DE | EN
- Tabelle: Timestamp | Text (editierbar) | Char-Count
- Suchen + Ersetzen
- Video-Player mit Untertitel-Overlay (HTML5 video + VTT track)
- Download als SRT
- Validierungs-Warnungen (> 42 chars, Überlappungen)

---

## Test-Kriterien
- [ ] Beschreibung < 5000 Zeichen mit Kapitelmarken
- [ ] Tags < 500 Zeichen total
- [ ] Untertitel DE korrekt formatiert (SRT)
- [ ] Untertitel EN ist sinnvolle Übersetzung
- [ ] Video-Preview mit Untertitel-Overlay funktioniert

## Commit
`feat(podcast): description + SEO + subtitles DE/EN`
