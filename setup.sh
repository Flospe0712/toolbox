#!/bin/bash
#═══════════════════════════════════════════════════════════════
#  Shipyard Deploy + Podcast Pipeline Setup
#  Führe dieses Script auf dem VPS aus NACHDEM du:
#  1. Supabase Projekt erstellt hast
#  2. Google Cloud Projekt erstellt hast (optional, für Phase 5)
#  3. Die Keys bereit hast
#═══════════════════════════════════════════════════════════════

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Shipyard + Podcast Pipeline — Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ─── 1. Shipyard kopieren ─────────────────────────────────────────────────────

echo "═══ 1/6 — Shipyard installieren ═══"

if [ -d /opt/shipyard ]; then
    warn "Shipyard existiert bereits in /opt/shipyard"
else
    # Vom Upload oder Git
    if [ -d /opt/content-dashboard-template-main ]; then
        mv /opt/content-dashboard-template-main /opt/shipyard
    elif [ -f /tmp/content-dashboard-template-main.zip ]; then
        cd /opt && unzip /tmp/content-dashboard-template-main.zip
        mv content-dashboard-template-main /opt/shipyard
    else
        err "Shipyard-Template nicht gefunden!"
        echo "  Bitte entpacke das ZIP nach /opt/shipyard"
        exit 1
    fi
fi

cd /opt/shipyard
log "Shipyard in /opt/shipyard"

# ─── 2. Dependencies ──────────────────────────────────────────────────────────

echo ""
echo "═══ 2/6 — Dependencies installieren ═══"
npm install 2>&1 | tail -3
npm install googleapis rss 2>&1 | tail -2
log "Dependencies installiert"

# ─── 3. .env.local ───────────────────────────────────────────────────────────

echo ""
echo "═══ 3/6 — Konfiguration ═══"

if [ -f .env.local ]; then
    warn ".env.local existiert bereits"
else
    cat > .env.local << 'ENVEOF'
# ═══ Supabase (PFLICHT) ═══
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ═══ App ═══
NEXT_PUBLIC_BASE_URL=https://tools.assisstant.win

# ═══ AI (PFLICHT) ═══
ANTHROPIC_API_KEY=

# ═══ YouTube API (für Phase 5, optional erstmal) ═══
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=https://tools.assisstant.win/api/auth/youtube/callback
CHANNEL_ID=UCRUfL9dUygCVbd7KgjwlIdw

# ═══ Internal (für OpenClaw API-Zugriff) ═══
INTERNAL_API_KEY=changeme-random-string-here

# ═══ Optional ═══
# OPENAI_API_KEY=
# METRICOOL_API_TOKEN=
# TAVILY_API_KEY=
ENVEOF

    warn ".env.local erstellt — MUSS NOCH AUSGEFÜLLT WERDEN!"
    echo ""
    echo -e "  ${YELLOW}Öffne /opt/shipyard/.env.local und füge ein:${NC}"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - ANTHROPIC_API_KEY"
    echo ""
fi

# ─── 4. Planning-Dateien kopieren ─────────────────────────────────────────────

echo "═══ 4/6 — GSD Planning-Dateien ═══"
mkdir -p /opt/shipyard/phases
# Die Phasen-Dateien müssen manuell kopiert werden oder sind schon da
log "Planning-Verzeichnis bereit"

# ─── 5. PM2 Setup ────────────────────────────────────────────────────────────

echo ""
echo "═══ 5/6 — PM2 Setup ═══"

if ! command -v pm2 &>/dev/null; then
    npm install -g pm2 2>&1 | tail -1
fi

# Alten toolbox Service stoppen falls vorhanden
pm2 delete toolbox 2>/dev/null || true

# Shipyard nur starten wenn .env.local ausgefüllt ist
if grep -q "^NEXT_PUBLIC_SUPABASE_URL=$" .env.local 2>/dev/null; then
    warn "PM2 noch nicht gestartet — erst .env.local ausfüllen!"
    echo "  Danach: cd /opt/shipyard && npm run build && pm2 start npm --name shipyard -- start -- -p 3000"
else
    echo "Building..."
    npm run build 2>&1 | tail -5
    pm2 start npm --name shipyard -- start -- -p 3000 2>/dev/null
    pm2 save 2>/dev/null
    log "Shipyard läuft auf Port 3000"
fi

# ─── 6. Cloudflare Tunnel ────────────────────────────────────────────────────

echo ""
echo "═══ 6/6 — Cloudflare Tunnel ═══"

TUNNEL_CONFIG="$HOME/.cloudflared/config.yml"
if [ -f "$TUNNEL_CONFIG" ]; then
    if grep -q "8080" "$TUNNEL_CONFIG"; then
        sed -i 's/localhost:8080/localhost:3000/g' "$TUNNEL_CONFIG"
        systemctl restart cloudflared 2>/dev/null || true
        log "Tunnel umgestellt: tools.assisstant.win → localhost:3000"
    elif grep -q "3000" "$TUNNEL_CONFIG"; then
        log "Tunnel zeigt bereits auf Port 3000"
    else
        warn "Tunnel-Config manuell prüfen: $TUNNEL_CONFIG"
    fi
else
    warn "Keine Cloudflare Tunnel Config gefunden"
fi

# ─── Zusammenfassung ──────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup abgeschlossen!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Nächste Schritte:"
echo ""
echo "  1. .env.local ausfüllen:"
echo "     nano /opt/shipyard/.env.local"
echo ""
echo "  2. Supabase Schema laden:"
echo "     → Supabase Dashboard → SQL Editor"
echo "     → supabase/schema.sql ausführen"
echo "     → supabase/podcast-schema.sql ausführen"
echo ""
echo "  3. Build + Start:"
echo "     cd /opt/shipyard && npm run build && pm2 restart shipyard"
echo ""
echo "  4. Testen:"
echo "     https://tools.assisstant.win"
echo ""
echo "  5. Podcast Pipeline coden lassen:"
echo "     tmux new -s podcast"
echo "     cd /opt/shipyard && openclaw tui"
echo "     → TUI-Befehl aus TUI-COMMAND.md einfügen"
echo "     → Ctrl+B, D"
echo ""
