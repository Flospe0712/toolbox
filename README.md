# Shipyard — Content Dashboard Template

An open-source content management dashboard for creators managing multi-platform content pipelines. Built with Next.js 16, React 19, Supabase, and DaisyUI 5.

Manage your YouTube videos, Instagram posts, LinkedIn content, ideas, thumbnails, competitors, analytics, and more — all from one dark-mode dashboard.

## Features

- **Multi-platform content management** — YouTube, Instagram, LinkedIn
- **Idea pipeline** — capture ideas, track status, link relationships, visualize with node graph
- **Video management** — scripts, titles, descriptions, thumbnails, A/B variants, transcriptions
- **Social post drafting** — create and schedule posts across platforms
- **Thumbnail studio** — upload, rate, generate (DALL-E), and assign thumbnails
- **Competitor tracking** — monitor follower counts, bio changes, new posts (via ScapeCreators)
- **Content calendar** — visual calendar view of scheduled and published content
- **Analytics dashboard** — cross-platform metrics with sparklines and weekly comparisons
- **Blog editor** — rich text editing with BlockNote
- **Research notes** — shared knowledge base linked to ideas and videos
- **Format library** — save and reuse content formats/templates
- **Topic management** — organize content into topic clusters and series
- **News feed** — curated industry news via Tavily API
- **Cron jobs** — automated competitor syncing and idea cross-linking
- **Realtime updates** — live data sync via Supabase Realtime

## Tech Stack

- **Framework:** Next.js 16 (App Router) with Turbopack
- **UI:** Tailwind CSS 4 + DaisyUI 5 + shadcn/ui
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Auth:** Supabase Auth
- **AI:** Anthropic Claude (captions, insights) + OpenAI DALL-E (thumbnails)
- **Rich editors:** BlockNote (text), Excalidraw (diagrams)
- **Testing:** Vitest + Testing Library

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/content-dashboard-template.git
cd content-dashboard-template
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy your project URL and keys
3. Create the database schema — go to **SQL Editor** in your Supabase dashboard and run the contents of [`supabase/schema.sql`](supabase/schema.sql)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase credentials. All other integrations are optional — the dashboard works without them, you just won't see data for unconfigured services.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up for an account.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your app URL (e.g. `http://localhost:3000`) |
| `METRICOOL_API_TOKEN` | No | Metricool — enables social scheduling & analytics |
| `OPENAI_API_KEY` | No | OpenAI — enables AI thumbnail generation |
| `ANTHROPIC_API_KEY` | No | Anthropic — enables AI captions & insights |
| `SCRAPECREATORS_API_KEY` | No | ScapeCreators — enables competitor tracking |
| `TAVILY_API_KEY` | No | Tavily — enables news feed |
| `CRON_SECRET` | No | Secret for authenticating Vercel Cron requests |

See [`.env.example`](.env.example) for the full list with setup links.

## Project Structure

```
app/
  api/              # API routes (videos, ideas, social, competitors, etc.)
  dashboard/        # Dashboard pages
    instagram/      # Instagram content
    ideas/          # Idea pipeline
    videos/         # Video management
    thumbnails/     # Thumbnail studio
    competitors/    # Competitor tracking
    analytics/      # Cross-platform analytics
    calendar/       # Content calendar
    blog/           # Blog editor
    research/       # Research notes
    formats/        # Format library
    topics/         # Topic management
    news/           # News feed
    settings/       # User settings
  login/            # Auth pages

components/         # React components (60+)
lib/                # Utilities, Supabase clients, types
supabase/
  schema.sql        # Complete database schema (run once in Supabase SQL Editor)
```

## Deploying to Vercel

1. Push your repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add your environment variables in the Vercel dashboard
4. (Optional) Set up cron jobs — the `vercel.json` already includes schedules for:
   - **Competitor sync** — runs daily at 4 AM UTC
   - **Ideas autolink** — runs daily at 3 AM UTC

## Customization

This template is designed to be forked and customized. Common modifications:

- **Branding:** Update the logo/name in `components/sidebar.tsx` (search for "Shipyard")
- **Platforms:** Add/remove platform support by modifying sidebar nav and creating new dashboard pages
- **Integrations:** Swap out Metricool for your preferred scheduling tool by updating the relevant API routes
- **Theme:** Modify `app/globals.css` to customize the DaisyUI dark theme

## License

[CC BY-NC 4.0](LICENSE) — free to use and modify, but not for commercial purposes.
