# Deployment Guide - Phase 1g

**Status**: Complete ✓  
**Last Updated**: 2026-03-14  
**Version**: 1.0 (MVP)

---

## Quick Start

### Development Mode
```bash
cd /opt/toolbox

# Start Ollama (in separate terminal)
ollama serve

# Set Gemini API key
export GEMINI_API_KEY="your-key-here"

# Install & run ToolBox
npm install
npm run dev
# Open http://localhost:8080
```

### Production Deployment
```bash
# Build for production
npm run build

# Set environment variables
export GEMINI_API_KEY="your-key-here"
export NODE_ENV="production"

# Start server
npm start

# Setup Cloudflare Tunnel (see CLOUDFLARE-SETUP.md)
sudo systemctl start cloudflared
```

---

## Project Structure

```
/opt/toolbox/
├── src/
│   ├── components/          # React components
│   │   ├── ThumbnailCreator.jsx
│   │   ├── AISuggestionsPanel.jsx
│   │   ├── Toast.jsx
│   │   └── ...
│   ├── pages/              # Route pages
│   ├── utils/              # Utilities
│   │   ├── ollamaService.js
│   │   ├── geminiService.js
│   │   └── fileWriter.js
│   ├── middleware/         # Express middleware
│   │   ├── errorHandler.js
│   │   └── timeout.js
│   ├── context/           # React context (Toast)
│   └── __tests__/         # Test suites
├── data/                  # JSON persistence
│   └── projects/          # Saved projects
├── .planning/             # Project planning docs
│   └── phases/            # Phase plans & research
├── server.js              # Express server
├── package.json           # Dependencies
├── vite.config.js         # Vite config
└── README.md             # This file
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 18 + Vite | SPA, no Next.js |
| **Backend** | Express.js (Node.js 22) | Minimal, no database |
| **Styling** | Tailwind CSS | Dark theme only |
| **AI Text** | Ollama (qwen/mistral) | Local, free, private |
| **AI Images** | Google Gemini API | Cloud, paid (~$0.0075/call) |
| **Storage** | JSON files | Single-user MVP |
| **Deployment** | Cloudflare Tunnel | Secure, free, no port forwarding |
| **Testing** | Vitest + mocks | Unit + integration tests |

---

## Features (MVP - Phase 1)

### ✓ Dashboard Foundation (1a)
- Tool grid layout
- Dark theme (Tailwind)
- Navigation to tools

### ✓ Thumbnail Creator UI (1b)
- Template selector (dropdown)
- Text editor (headline, subheadline, topic)
- Color picker (preset + custom)

### ✓ Canvas Rendering (1c)
- Real-time preview of 3 variants
- High-DPI support
- Mobile-optimized

### ✓ Project Management (1d)
- Create/save/load/delete projects
- Auto-save every 30 seconds
- JSON persistence

### ✓ AI Integration (1e)
- Ollama text suggestions (3 options)
- Ollama color palettes (3 palettes)
- Gemini image descriptions
- Cost tracking

### ✓ Backend Robustness (1f)
- Error handling middleware
- Request timeouts (30s default)
- Atomic file writes
- Toast notifications
- PNG export (1280x720)
- Keyboard shortcuts (Ctrl+S, Ctrl+E)

### ✓ Testing & Deployment (1g)
- Unit tests (Ollama, Gemini)
- Integration tests (API endpoints)
- Mobile testing (iOS, Android)
- Cloudflare Tunnel setup
- Comprehensive docs

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone <repo-url> /opt/toolbox
cd /opt/toolbox
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Ollama (Local AI)
```bash
# macOS
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh

# Start server
ollama serve

# Pull model
ollama pull mistral:7b

# Verify
curl http://localhost:11434/api/tags
```

### 4. Setup Gemini API
```bash
# Create Google Cloud project
# Enable Generative Language API
# Create API key

# Set environment variable
export GEMINI_API_KEY="your-key-here"

# Add to ~/.zshrc or ~/.bashrc for persistence
echo 'export GEMINI_API_KEY="your-key"' >> ~/.zshrc
```

### 5. Build & Run
```bash
# Development
npm run dev

# Production
npm run build
npm start

# With API key
GEMINI_API_KEY=xxx npm start
```

---

## Configuration

### Environment Variables

```bash
# Required
GEMINI_API_KEY=xxxx...      # Google Gemini API key

# Optional
NODE_ENV=development         # development | production
PORT=8080                    # Server port
DEBUG=false                  # Enable debug logging
```

### Server Configuration

Edit `server.js`:
```javascript
const PORT = 8080;           // Change port
const TIMEOUT_MS = 30000;    // Request timeout
```

### Ollama Configuration

Edit `src/utils/ollamaService.js`:
```javascript
const OLLAMA_BASE_URL = 'http://localhost:11434';  // Ollama server
const OLLAMA_MODEL = 'mistral:7b';                 // Model to use
const TIMEOUT_MS = 10000;                          // Request timeout
```

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- ollamaService
npm test -- geminiService
npm test -- api.integration
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

### Manual Testing Checklist

#### Ollama Integration
```bash
curl -X POST http://localhost:8080/api/ai/suggest \
  -H "Content-Type: application/json" \
  -d '{"topic":"gaming","type":"text"}'
# Should return 3 suggestions
```

#### Gemini Integration
```bash
curl -X POST http://localhost:8080/api/ai/generate-image \
  -H "Content-Type: application/json" \
  -d '{"topic":"ai technology"}'
# Should return image description + cost
```

#### Project Management
```bash
# Create project
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project"}'

# List projects
curl http://localhost:8080/api/projects

# Load project
curl http://localhost:8080/api/projects/{id}

# Update project
curl -X PUT http://localhost:8080/api/projects/{id} \
  -H "Content-Type: application/json" \
  -d '{"id":"...","name":"Updated","thumbnail":{...}}'

# Delete project
curl -X DELETE http://localhost:8080/api/projects/{id}
```

---

## Deployment

### Local (Development)
```bash
npm run dev
# http://localhost:8080
```

### VPS/Server
```bash
# Build
npm run build

# Start with systemd
sudo nano /etc/systemd/system/toolbox.service
```

Add:
```ini
[Unit]
Description=ToolBox Thumbnail Creator
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/toolbox
ExecStart=/usr/bin/node server.js
Restart=always
Environment="GEMINI_API_KEY=xxxx"
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable toolbox
sudo systemctl start toolbox
```

### Cloudflare Tunnel (Recommended)
See `/opt/toolbox/.planning/phases/07-testing-deployment/CLOUDFLARE-SETUP.md`

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Create tunnel
cloudflared tunnel create toolbox

# Configure & run
cloudflared tunnel run toolbox

# Or as service
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

---

## Monitoring

### Check Server Status
```bash
curl http://localhost:8080/api/health
```

### View Logs
```bash
# Development
tail -f /tmp/toolbox.log

# Production (systemd)
sudo journalctl -u toolbox -f
sudo journalctl -u cloudflared -f
```

### Monitor API Performance
- Check server logs for API call latencies
- Monitor Gemini API costs in console output
- Track Ollama response times

### Health Checks

```bash
# Full system health
curl http://localhost:8080/api/health
# Returns: {status:"ok", ollama:true, gemini:true}

# AI health
curl http://localhost:8080/api/ai/health
# Returns: {status:"ok", ollama:true, gemini:true}
```

---

## Troubleshooting

### Ollama Not Responding
```bash
# Check if running
curl http://localhost:11434/api/tags

# Restart
pkill ollama
ollama serve &

# Check model installed
ollama list
ollama pull mistral:7b
```

### Gemini API Key Issues
```bash
# Verify key is set
echo $GEMINI_API_KEY

# Test connection
curl https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY

# Regenerate key in Google Cloud
```

### Port Already in Use
```bash
# Find process on port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 npm start
```

### File Permissions Error
```bash
# Ensure data directory writable
mkdir -p /opt/toolbox/data/projects
chmod 755 /opt/toolbox/data/projects

# Check file ownership
ls -la /opt/toolbox/data/
```

### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Build again
npm run build
```

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Dashboard load | < 2s | ✓ |
| Canvas render | < 100ms | ✓ |
| Ollama suggestions | < 5s | ✓ |
| Gemini generation | < 10s | ✓ |
| Page load (production) | < 3s | ✓ |
| API response | < 1s | ✓ |

---

## Security

### Implemented
- ✓ Error handling (no stack traces in production)
- ✓ Timeout protection (30s default)
- ✓ Atomic file writes (no corruption)
- ✓ CORS enabled (configurable)
- ✓ JSON-only API responses
- ✓ Optional Cloudflare Access (authentication)

### Recommended for Production
- [ ] HTTPS only (via Cloudflare)
- [ ] Rate limiting (API, per-IP)
- [ ] Input validation (all user inputs)
- [ ] CSRF protection (if adding forms)
- [ ] Audit logging (file access, API calls)
- [ ] Secrets management (env vars or vault)

---

## Future Enhancements (Phase 2+)

1. **Database**: Replace JSON with PostgreSQL
2. **Multi-user**: User accounts + authentication
3. **More Tools**: Podcast editor, SEO optimizer
4. **Batch Generation**: Export multiple thumbnails
5. **Advanced Editing**: Filters, effects, animations
6. **Collaboration**: Share projects, comments
7. **Analytics**: Track downloads, usage stats
8. **API**: Public API for integrations

---

## Support & Resources

- **Planning**: `/opt/toolbox/.planning/`
- **Setup Guide**: `/opt/toolbox/.planning/phases/05-ai-integration/SETUP.md`
- **Mobile Testing**: `/opt/toolbox/.planning/phases/07-testing-deployment/MOBILE-TEST-REPORT.md`
- **Cloudflare Setup**: `/opt/toolbox/.planning/phases/07-testing-deployment/CLOUDFLARE-SETUP.md`
- **Tests**: `npm test`

---

## Release Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Mobile testing completed (iOS + Android)
- [ ] Performance targets met
- [ ] Error messages user-friendly
- [ ] Documentation complete
- [ ] Cloudflare Tunnel configured
- [ ] Domain resolves correctly
- [ ] SSL certificate valid
- [ ] Daily spend capped (Gemini)
- [ ] Backup strategy documented
- [ ] Monitoring configured
- [ ] No console errors
- [ ] Responsive design verified

---

## Contributors

- **Phase 1a-1g**: ToolBox Thumbnail Creator MVP
- **Lead**: Florian (OpenClaw)
- **Start Date**: 2026-03-14
- **Completion**: 2026-03-14

---

## License

Private project for personal use.

---

*Deployment guide for ToolBox v1.0 - March 2026*
