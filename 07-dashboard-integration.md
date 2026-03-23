# Phase 7: Dashboard-Integration + Pipeline-Wizard

---

## Ziel
Alles zusammenführen: Step-by-Step Wizard, Episode-Übersicht, Sidebar-Integration.

---

## Tasks

### 7.1 — Podcast Dashboard Page
**Datei:** `app/dashboard/podcast/page.tsx`

- Server Component: Lädt alle Episoden aus Supabase
- Episode-Grid (wie VideoGrid, aber für Podcast-Episoden):
  - Thumbnail-Preview
  - Titel
  - Status-Badge (farbig, wie Shipyard's StatusConfig)
  - Datum (timeAgo)
  - YouTube-Link (wenn published)
  - Podcast-Status Icon
- Filter: Alle | Drafts | Published
- "Neue Episode" Button → /dashboard/podcast/new
- Sortierung: Neueste zuerst

### 7.2 — Episode Detail Page (Wizard)
**Datei:** `app/dashboard/podcast/[id]/page.tsx`

- Server Component: Lädt Episode + Thumbnails + Config
- Step-by-Step Wizard mit Tabs (Shipyard's Tab-Pattern):
  1. **Upload & Analyse** — TranscriptAnalyzer
  2. **Thumbnails** — ThumbnailGenerator + PreviewPlayer
  3. **Beschreibung & SEO** — DescriptionEditor
  4. **Untertitel** — SubtitleManager
  5. **YouTube** — YouTubePublisher
  6. **Podcast** — PodcastDistributor
- Stepper-Leiste oben mit Status-Icons pro Step
- Jeder Tab navigierbar (nicht nur linear)
- Auto-Save bei Tab-Wechsel

### 7.3 — Sidebar-Integration
**Datei:** `components/sidebar.tsx` (modifizieren)

Neuen Eintrag in `sections` Array:
```typescript
{
  label: 'Create',
  items: [
    { href: '/dashboard/youtube',   label: 'YouTube',   icon: Youtube,   color: '#dc2626' },
    { href: '/dashboard/podcast',   label: 'Podcast',   icon: Mic,       color: '#8b5cf6' },  // NEU
    { href: '/dashboard/instagram', label: 'Instagram', icon: Instagram, color: '#e1306c' },
    { href: '/dashboard/linkedin',  label: 'LinkedIn',  icon: Linkedin,  color: '#0077b5' },
  ],
},
```

Import `Mic` von lucide-react.

### 7.4 — Home Dashboard Widgets
**Datei:** `components/home/podcast-summary.tsx`

- Widget auf der Dashboard Home-Seite:
  - Letzte Episode (Titel + Status)
  - Nächste geplante Episode
  - Podcast-Stats (Episoden-Count, Published Count)
  - Quick-Action: "Neue Episode"
- Einbinden in `app/dashboard/page.tsx`

### 7.5 — Auto-Pipeline API
**Datei:** `app/api/podcast/episodes/[id]/auto-pipeline/route.ts`

- POST: Führt Analyse + Thumbnails + Beschreibung + Untertitel automatisch aus
- Sequentiell: Schritt für Schritt
- Status-Updates nach jedem Schritt
- Am Ende: Status "ready" → User reviewt + klickt "Publish"
- Kann über OpenClaw/Telegram getriggert werden via INTERNAL_API_KEY

### 7.6 — Podcast Settings Page
**Datei:** `app/dashboard/podcast/settings/page.tsx`

- Podcast-Konfiguration
- YouTube-Auth Status
- Branding-Sync Button
- RSS Feed URL + Validierung
- Plattform-Status

---

## Test-Kriterien
- [ ] /dashboard/podcast zeigt Episode-Grid
- [ ] /dashboard/podcast/new → Upload-Flow
- [ ] /dashboard/podcast/[id] → Wizard mit allen Tabs
- [ ] Sidebar zeigt "Podcast" Eintrag
- [ ] Home-Widget zeigt Podcast-Summary
- [ ] Auto-Pipeline läuft durch (analyze → ready)
- [ ] Bestehende Shipyard-Features nicht beeinträchtigt

## Commit
`feat(podcast): dashboard integration + wizard`
