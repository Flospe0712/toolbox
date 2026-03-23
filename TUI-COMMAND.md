# TUI-Befehl — Shipyard Podcast Pipeline

## Für OpenClaw TUI oder Claude Code direkt

### Befehl (Copy-Paste in TUI):

```
cd /opt/shipyard && arbeite die Podcast Pipeline ab. Lies MASTERPLAN.md und alle Phasen in phases/ (00-07). Das Projekt ist Shipyard — ein Next.js 16 + React 19 + Supabase + TypeScript Content Dashboard. Folge EXAKT den bestehenden Patterns: API Routes mit createClient + service role, 'use client' Komponenten, Shipyard's Dark Theme (#0d0d0d, rgba borders), lucide-react Icons, DaisyUI + Tailwind. Erweitere lib/types.ts, sidebar.tsx, bestehende Dateien — NICHT neu erstellen. Phase 0 (Deploy) ist SCHON ERLEDIGT. Starte mit Phase 1 (Schema + API). Teste nach jeder Phase mit npm run build. Committe atomar. Arbeite komplett autonom. DONE wenn Phase 7 committed ist.
```

### Voraussetzung:
1. Shipyard ist deployed (/opt/shipyard)
2. .env.local hat Supabase + Anthropic Keys
3. podcast-schema.sql wurde in Supabase ausgeführt
4. npm install googleapis rss wurde ausgeführt
