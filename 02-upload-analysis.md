# Phase 2: Upload + Transkript-Analyse

---

## Ziel
Episode-Dateien hochladen (Supabase Storage), Transkript mit Haiku analysieren.

---

## Tasks

### 2.1 — Supabase Storage Buckets
Erstelle in der API oder per SQL:
- Bucket `podcast-videos` (public: false, max: 2GB)
- Bucket `podcast-audio` (public: true, max: 500MB) ← public für RSS
- Bucket `podcast-transcripts` (public: false)
- Bucket `podcast-subtitles` (public: true)

### 2.2 — Upload API Route
**Datei:** `app/api/podcast/episodes/upload/route.ts`

- POST: Multipart Upload (MP4 / MP3 / TXT|SRT)
- Erkennung per Extension welche Datei was ist
- Upload zu Supabase Storage (je nach Typ in richtigen Bucket)
- Episode in DB erstellen mit Pfaden
- Response: Episode-Objekt mit Status "uploaded"

### 2.3 — Transkript-Analyse API
**Datei:** `app/api/podcast/episodes/[id]/analyze/route.ts`

- POST: Analysiert Transkript mit Anthropic SDK (bereits in Shipyard)
- Nutze bestehenden `@anthropic-ai/sdk` Import
- Haiku-Prompt: Thema, Summary DE/EN, Keywords, Kapitel, Gäste, Mood, Thumbnail-Vorschläge
- Transkript in Chunks wenn > 100k chars
- Ergebnis in `analysis` JSONB-Feld speichern
- Status → "analyzed"

### 2.4 — Transkript-Parser Utility
**Datei:** `lib/transcript-parser.ts`

- SRT → Text + Segments extrahieren
- VTT → Text + Segments
- TXT → Nur Text (keine Timestamps)
- Nutze gleiche Segment-Struktur wie `video_transcriptions` Tabelle

### 2.5 — Upload-Seite
**Datei:** `app/dashboard/podcast/new/page.tsx`

- Drag & Drop Zone (3 Felder: Video, Audio, Transkript)
- Fortschrittsbalken pro Datei
- Auto-Detect Dateityp per Extension
- Nach Upload: Auto-Analyse starten
- Analyse-Ergebnis anzeigen (editierbar):
  - Titel (DE/EN)
  - Keywords (Tag-Chips)
  - Kapitelmarken (Tabelle)
  - Gäste
  - Mood
- "Weiter →" Button

**Style:** Folge exakt Shipyard's Dark-Theme Pattern:
- Background: `#0d0d0d`
- Cards: `rgba(255,255,255,0.03)` border
- Text: `rgba(255,255,255,0.9)` / `rgba(255,255,255,0.4)`
- Accent: Von bestehenden Farben (emerald, amber, sky)

---

## Test-Kriterien
- [ ] Upload MP4+MP3+TXT → Supabase Storage
- [ ] Transkript-Analyse liefert korrektes JSON
- [ ] Analyse-Felder sind im Frontend editierbar
- [ ] Status-Transition: uploaded → analyzing → analyzed

## Commit
`feat(podcast): episode upload + transcript analysis`
