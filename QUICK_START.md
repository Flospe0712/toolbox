# Quick Start Guide

## For Developers

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### Setup

```bash
# Clone the repository
cd /opt/toolbox

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production validation
./scripts/validate-production.sh
```

### Development Commands

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build production bundle
npm run build

# Run tests (if configured)
npm run test

# Run E2E tests
npm run test:e2e

# Run validation script
./scripts/validate-production.sh

# Check build size
npm run build && du -sh dist/
```

## For Users

### Using YouTube Tools

1. **Open the Application**
   - Navigate to http://localhost:5173 (development)
   - Or deployed production URL

2. **Select a Tool**
   - Click on any tool card from the dashboard
   - Each tool opens in a dedicated modal interface

3. **Fill in the Form**
   - Required fields marked with *
   - Follow helper text for guidance
   - Use previews to see results in real-time

4. **Generate/Process**
   - Click the action button (Generate, Optimize, Create, etc.)
   - Wait for the loading spinner
   - Review results in the preview pane

5. **Use Results**
   - Copy results to clipboard
   - Download files if applicable
   - Share or implement in your YouTube channel

### Tool Quick Reference

| Tool | What it Does | Time | Input |
|------|-------------|------|-------|
| Script Generator | Create video scripts | 5-10s | Topic, style, length |
| SEO Optimizer | Optimize titles, tags | 5-8s | Title, description, tags |
| Subtitle Generator | Auto-generate subtitles | 10-30s | Video URL or audio file |
| Comment Moderator | Detect spam comments | 5-15s | Comments text |
| Banner Creator | Design channel banners | 5-10s | Channel name, theme |
| Playlist Manager | Manage playlists | 2-5s | Action, playlist details |
| Description Generator | Create descriptions | 5-10s | Title, topic |

## Troubleshooting

### "Tool not responding" / Timeout Error
1. Check your internet connection
2. Ensure the backend server is running
3. Try a simpler request first
4. Check server logs for errors

### "Rate limited" / Too many requests
1. Wait 30-60 seconds
2. Check if you're making multiple requests simultaneously
3. Try fewer items per request

### File upload fails
1. Check file size (max 500MB)
2. Verify file format (MP3, MP4, WAV, WebM)
3. Ensure file isn't corrupted
4. Try a smaller file first

### Preview not updating
1. Wait for the loading spinner to complete
2. Check for error messages (red boxes)
3. Refresh the page and try again
4. Check browser console (F12) for errors

## Browser Support

| Browser | Support | Version |
|---------|---------|---------|
| Chrome | ✅ Full | 90+ |
| Firefox | ✅ Full | 88+ |
| Safari | ✅ Full | 14+ |
| Edge | ✅ Full | 90+ |
| Mobile Chrome | ✅ Full | 90+ |
| Mobile Safari | ✅ Full | 12+ |

## Performance Tips

1. **Use Specific Topics**: More specific topics = faster, better results
2. **Smaller Files**: For audio/video uploads, use reasonable file sizes
3. **Stable Connection**: Use WiFi for large file uploads
4. **One at a Time**: Don't queue multiple requests simultaneously
5. **Browser Cache**: Clear cache if tools seem slow

## File Size Limits

- Audio/Video uploads: **500MB max**
- Images (if applicable): **10MB max**
- Text inputs: **5000 characters max**
- Batch operations: **100 items max**

## API Rate Limits

- Default: **10 requests per minute** per endpoint
- Batch operations: **5 requests per minute**
- File uploads: **3 per minute**
- When rate limited: Wait the specified time shown in error

## Keyboard Shortcuts (coming soon)

- `Ctrl/Cmd + Enter`: Submit form
- `Esc`: Close modal
- `Tab`: Navigate form fields
- `Alt + ?`: Show help

## Mobile Usage

All tools are fully responsive:
- **Phone (375px-480px)**: Single column, touch-optimized
- **Tablet (768px-1024px)**: Adjusted layout
- **Desktop (1920px+)**: Full two-column layout

## Getting Help

### Check These First
1. **Help docs**: Read tool descriptions
2. **Error message**: Usually explains the problem
3. **Example inputs**: Try the suggested formats
4. **Network tab**: (F12) Check for failed requests

### Report Issues
1. Note the exact error message
2. Check browser console (F12)
3. Check what you were trying to do
4. Share the error details with support

### Performance Issues
1. Close other browser tabs
2. Clear browser cache
3. Check internet connection speed
4. Try a different browser
5. Try again at a later time (may be server load)

## Tips for Best Results

### Script Generation
- Be specific about your topic
- Choose appropriate style and length
- Mention your target audience for better results

### SEO Optimization
- Use 50-60 character titles (YouTube best practice)
- Include main keywords in first 50 characters
- Use 5-7 relevant tags

### Subtitle Generation
- Ensure good audio quality in videos
- Use clear, standard language
- For multiple languages, generate separately

### Comment Moderation
- Paste naturally occurring comments
- Use consistent spacing between comments
- High threshold = fewer false positives

### Banner Creation
- Use simple, clear channel names
- Consider your brand identity
- Tagline should be concise (1-3 words)

### Playlist Management
- Keep playlists under 100 videos each
- Use consistent naming conventions
- Group related content

### Description Generation
- Provide specific, detailed titles
- Include relevant keywords
- Mention linked resources

## Advanced Usage

### Using the API Directly
```bash
# Example: Generate script
curl -X POST http://localhost:5173/api/youtube/script \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "How to learn React",
    "style": "educational",
    "length": 600,
    "targetAudience": "beginners"
  }'
```

### Batch Processing (via API)
Some endpoints support batch operations:
```bash
# Example: Moderate multiple comments
curl -X POST http://localhost:5173/api/youtube/moderate-comments \
  -H "Content-Type: application/json" \
  -d '{
    "comments": ["comment 1", "comment 2", "comment 3"],
    "threshold": 0.7
  }'
```

## System Requirements

### Minimum
- 2GB RAM
- Modern browser (last 2 versions)
- 10MB free disk space
- 1 Mbps internet connection

### Recommended
- 4GB+ RAM
- Latest browser version
- 50MB free disk space
- 10+ Mbps internet connection

## Version Info

- **Frontend**: React 18.2+ with Vite 5.4+
- **Backend**: Node.js 18+ with Express 4.18+
- **Database**: Optional (SQLite/MongoDB for history)
- **API**: RESTful with JSON payloads

---

**Need more help?** Check the full documentation in `YOUTUBE_INTEGRATION.md`
