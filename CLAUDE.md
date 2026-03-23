# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Open-source content management dashboard template for creators managing multi-platform content pipelines. Built with Next.js 16, React 19, Supabase, and DaisyUI 5. Designed to be cloned from GitHub and customized.

## Commands

```bash
npm run dev          # Start dev server (Turbopack enabled)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all tests (vitest)
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npx vitest run __tests__/api/ideas.test.ts  # Run a single test file
```

## Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router) with Turbopack
- **UI:** TailwindCSS 4 + DaisyUI 5 + shadcn/ui (new-york style, neutral base)
- **Database:** Supabase (PostgreSQL with RLS)
- **AI:** Anthropic SDK (Claude), OpenAI (DALL-E for thumbnails)
- **Integrations:** Metricool (scheduling & analytics), Tavily (news/research), ScapeCreators (competitor tracking)
- **Testing:** Vitest + Testing Library + jsdom
- **Rich editors:** BlockNote (text), Excalidraw (diagrams)

### Path Alias
`@/*` resolves to the project root (configured in tsconfig.json).

### API Routes (`app/api/`)
- API routes following a consistent pattern:
  - Create a top-level `supabase` client using `createClient` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
  - Export named functions: `GET`, `POST`, `PATCH`, `DELETE`
  - Dynamic routes use `{ params }: { params: Promise<{ id: string }> }` (Next.js 16 async params)
  - Return `NextResponse.json()` with appropriate status codes

### Authentication
- **Middleware** (`middleware.ts`): Supabase session auth for dashboard routes
- **Server components** use `lib/supabase/server.ts` (`createClient` with cookies)
- **Client components** use `lib/supabase/client.ts`
- Public paths: `/login`, `/forgot-password`, `/reset-password`, `/auth/callback`

### Dashboard Pages (`app/dashboard/`)
- **Platforms:** `/youtube`, `/instagram`, `/linkedin`
- **Content:** `/ideas`, `/topics`, `/formats`
- **Analyze:** `/competitors`, `/analytics`, `/calendar`
- **Tools:** `/news`

### Core Types (`lib/types.ts`)
Key domain types: `Idea`, `Video`, `Asset`, `Thumbnail`, `SocialPost`, `Topic`, `Competitor`. Status enums: `IdeaStatus`, `VideoStatus`, `SocialPostStatus`. Platform type covers youtube, tiktok, instagram, twitter, linkedin.

### Database
- Supabase migrations in `supabase/migrations/`
- RLS enabled on user-facing tables
- Hard deletes with `ON DELETE CASCADE`
- Key tables: `ideas`, `videos`, `assets`, `social_posts`, `thumbnails`, `competitors`, `topics`
- Junction tables: `idea_platforms`, `idea_tag_links`, `video_thumbnails`

### Components (`components/`)
- Mix of server (async) and client (`'use client'`) components
- Dashboard home widgets: `action-queue.tsx`, `pipeline-summary.tsx`, `posting-tracker.tsx`, `competitor-intel.tsx`, `content-calendar.tsx`
- Interactive features: `metricool-scheduler.tsx`, `idea-node-graph.tsx`
- Realtime updates via `dashboard-realtime-wrapper.tsx`

### Key Integration Patterns
- **Metricool:** Social media scheduling & analytics via `METRICOOL_API_TOKEN`
- **DALL-E:** Thumbnail generation at 1792x1024
- **Tavily:** News/research API
- **ScapeCreators:** Competitor tracking (YouTube, Instagram follower counts, bio changes, new posts)
- **Cron jobs:** Competitor sync (`/api/cron/competitor-sync`), Ideas autolink (`/api/cron/ideas-autolink`)

### Removed Features (do not re-add)
- Morning Reports (daily digest generation) — removed during template cleanup
- AI Content Gallery / AI Studio — removed during template cleanup
- Agent Todos (task queue for AI agents) — removed during template cleanup
- Laura/Kevin agent references — removed; use generic agent names if needed
- YouTube OAuth / Google API connection — removed; analytics via Metricool only
- LinkedIn OAuth / LinkedIn API connection — removed; analytics via Metricool only

### Template Notes
- This is a public template repo — avoid hardcoding personal data (names, channel IDs, URLs)
- Integrations should fail gracefully when API keys are not configured
- The `next.config.ts` has webpack resolve config to handle directory paths with spaces
