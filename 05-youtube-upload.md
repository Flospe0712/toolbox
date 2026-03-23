# Phase 5: YouTube OAuth2 + Upload

---

## Ziel
YouTube OAuth2 Auth-Flow, Video + Thumbnail + Untertitel auf YouTube hochladen.

HINWEIS: Shipyard hatte YouTube OAuth bewusst entfernt.
Wir fügen es GEZIELT für den Podcast-Upload wieder hinzu.

---

## Tasks

### 5.1 — YouTube OAuth2 Flow
**Dependencies:** `npm install googleapis`
**Datei:** `lib/youtube-api.ts`

```typescript
import { google } from 'googleapis'
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
)
```

**Datei:** `app/api/auth/youtube/route.ts`
- GET: Redirect zu Google Consent Screen
- Scopes: youtube.upload, youtube.readonly, youtube.force-ssl

**Datei:** `app/api/auth/youtube/callback/route.ts`
- GET: OAuth2 Callback → Tokens in youtube_tokens Tabelle speichern
- Redirect zurück zu /dashboard/podcast

**Datei:** `app/api/auth/youtube/status/route.ts`
- GET: Prüft ob gültige Tokens vorhanden (auto-refresh wenn nötig)

### 5.2 — Video Upload API
**Datei:** `app/api/podcast/episodes/[id]/publish/youtube/route.ts`

- POST: Kompletter YouTube Upload
- Flow:
  1. Tokens laden + auto-refresh
  2. Video aus Supabase Storage streamen → YouTube (resumable upload)
  3. Metadaten setzen (title, description, tags, category, language)
  4. Thumbnail hochladen (youtube.thumbnails.set)
  5. Untertitel DE + EN hochladen (youtube.captions.insert)
  6. Video ID + URL in episode speichern
  7. Status → "published"

- Privacy: Default "unlisted" (User kann auf "public" ändern)
- Scheduled Publishing: Datum + Uhrzeit optional

### 5.3 — YouTube Publisher Komponente
**Datei:** `components/podcast/youtube-publisher.tsx`

- Auth-Status (verbunden / nicht verbunden)
- "Mit YouTube verbinden" Button → OAuth Flow
- Pre-Publish Checkliste:
  ✅ Video vorhanden
  ✅ Thumbnail ausgewählt
  ✅ Beschreibung fertig
  ✅ Tags gesetzt
  ✅ Untertitel generiert
- Privacy-Auswahl (Public/Unlisted/Private/Scheduled)
- Upload-Fortschritt (%)
- Nach Upload: YouTube-Link
- Quota-Anzeige (YouTube: 10.000 Units/Tag, Upload = 1.600)

---

## Test-Kriterien
- [ ] OAuth2 Login-Flow funktioniert
- [ ] Token-Refresh funktioniert
- [ ] Video Upload Code kompiliert (tatsächlicher Upload braucht echte Credentials)
- [ ] Checkliste zeigt korrekten Status
- [ ] Privacy-Auswahl speichert korrekt

## Commit
`feat(podcast): YouTube OAuth2 + video upload`
