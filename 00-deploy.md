# Phase 0: Shipyard auf VPS deployen

---

## Tasks

### 0.1 — Shipyard klonen + installieren
```bash
cd /opt
git clone <repo-url> shipyard   # oder vom Upload kopieren
cd shipyard
npm install
```

### 0.2 — .env.local erstellen
```bash
cat > /opt/shipyard/.env.local << 'EOF'
# Supabase (vom User ausgefüllt)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_BASE_URL=https://tools.assisstant.win

# AI
ANTHROPIC_API_KEY=

# YouTube (Phase 5)
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=https://tools.assisstant.win/api/auth/youtube/callback
CHANNEL_ID=UCRUfL9dUygCVbd7KgjwlIdw

# Internal API Key (für OpenClaw Zugriff)
INTERNAL_API_KEY=

# Optional (später)
OPENAI_API_KEY=
METRICOOL_API_TOKEN=
TAVILY_API_KEY=
EOF
```

### 0.3 — Production Build + PM2
```bash
npm install -g pm2
cd /opt/shipyard
npm run build
pm2 start npm --name shipyard -- start -- -p 3000
pm2 save
pm2 startup
```

### 0.4 — Cloudflare Tunnel updaten
Bestehende Cloudflare config anpassen:
- tools.assisstant.win → localhost:3000 (statt 8080)

```bash
# Cloudflare Tunnel Config anpassen
# /root/.cloudflared/config.yml → tools.assisstant.win service auf localhost:3000
```

### 0.5 — Supabase Schema laden
User muss im Supabase SQL Editor:
1. `supabase/schema.sql` ausführen (Basis-Schema)
2. Podcast-Erweiterung ausführen (Phase 1 erstellt das SQL)

### 0.6 — Smoke Test
```bash
curl -s http://localhost:3000 | head -5
# Sollte HTML zurückgeben
```

---

## Test-Kriterien
- [ ] npm run build erfolgreich
- [ ] PM2 läuft (pm2 status)
- [ ] https://tools.assisstant.win erreichbar
- [ ] Login-Seite erscheint
- [ ] Supabase-Verbindung funktioniert

## Commit
`chore: deploy Shipyard on VPS with PM2`
