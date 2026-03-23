import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Hash, Clock, Youtube, Instagram, Linkedin } from 'lucide-react'
import { StreakBadge } from '@/components/home/streak-badge'
import { ComingUp } from '@/components/home/coming-up'
import { MetricsStrip } from '@/components/home/metrics-strip'
import { PipelineSummary } from '@/components/home/pipeline-summary'
import { PostingTracker } from '@/components/posting-tracker'
import { CompetitorIntel } from '@/components/home/competitor-intel'
import { NewPostButton } from '@/components/new-post-button'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysStr = thirtyDaysAgo.toISOString()

  const [
    { data: videos },
    { data: socialPosts },
    { data: scheduledPosts },
    { data: recentPublished },
    { data: recentTopics },
    { data: recentSocial },
    { data: recentVideos },
  ] = await Promise.all([
    supabase.from('videos').select('id, status, platform, created_at').order('created_at', { ascending: false }),
    supabase.from('social_posts').select('id, platform, status, title').limit(200),
    supabase.from('social_posts').select('id, platform, status').eq('status', 'scheduled'),
    supabase.from('social_posts').select('id, platform, status').eq('status', 'published').gte('created_at', thirtyDaysStr),
    supabase.from('topics').select('id, name, status, target_posts, created_at').eq('status', 'active').order('created_at', { ascending: false }).limit(5),
    supabase.from('social_posts').select('id, platform, status, title, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('videos').select('id, title, status, platform, created_at').order('created_at', { ascending: false }).limit(10),
  ])

  const allSocial = socialPosts ?? []

  // ── Pipeline counts ─────────────────────────────────────────────────────────
  const draftsCount = allSocial.filter(p => p.status === 'draft' || p.status === 'backlog').length
  const inDevCount = (videos ?? []).filter(v => v.status === 'in_progress').length
    + allSocial.filter(p => p.status === 'in_progress').length
  const readyCount = (videos ?? []).filter(v => v.status === 'ready' || v.status === 'ready_to_create' || v.status === 'editing').length
    + allSocial.filter(p => p.status === 'ready' || p.status === 'ready_to_create').length
  const scheduledCount = (scheduledPosts ?? []).length
  const publishedCount = (videos ?? []).filter(v => v.status === 'published').length
    + (recentPublished ?? []).length

  const pipelineStages = [
    {
      label: 'Drafts',
      count: draftsCount,
      platforms: [],
      href: '/dashboard/instagram',
    },
    {
      label: 'In Dev',
      count: inDevCount,
      platforms: [],
      href: '/dashboard/instagram',
    },
    {
      label: 'Ready',
      count: readyCount,
      platforms: [],
      href: '/dashboard/instagram',
    },
    {
      label: 'Scheduled',
      count: scheduledCount,
      platforms: buildPlatformBreakdown(scheduledPosts ?? []),
      href: '/dashboard/calendar',
    },
    {
      label: 'Published',
      count: publishedCount,
      platforms: buildPlatformBreakdown(recentPublished ?? []),
      href: '/dashboard/analytics',
    },
  ]

  // ── Recent content ──────────────────────────────────────────────────────────
  const recentContent = [
    ...(recentSocial ?? []).map(p => ({
      id: p.id,
      title: p.title ?? 'Untitled post',
      platform: p.platform,
      status: p.status,
      created_at: p.created_at,
      href: `/dashboard/${p.platform}`,
    })),
    ...(recentVideos ?? []).map(v => ({
      id: v.id,
      title: v.title ?? 'Untitled video',
      platform: v.platform ?? 'youtube',
      status: v.status,
      created_at: v.created_at,
      href: `/dashboard/videos/${v.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)

  const estHour = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })).getHours()
  const greeting = estHour < 12 ? 'Good morning' : estHour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-8 space-y-6" style={{ background: '#0d0d0d', minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Your content dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge />
          <Link
            href="/dashboard/topics"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Hash className="w-4 h-4" /> New Topic
          </Link>
          <NewPostButton />
        </div>
      </div>

      {/* ── Metrics ────────────────────────────────────────────────────────── */}
      <MetricsStrip />

      {/* ── Pipeline + Recently Created ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div data-tour="pipeline">
          <PipelineSummary stages={pipelineStages} />
        </div>

        <div className="rounded-xl p-5 space-y-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: '#6366f1' }} />
            <h2 className="text-sm font-semibold text-white">Recently Created</h2>
          </div>

          {recentContent.length === 0 ? (
            <p className="text-[12px] py-4 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>No content yet</p>
          ) : (
            <div className="space-y-1.5">
              {recentContent.map(item => {
                const PlatformIcon = item.platform === 'instagram' ? Instagram : item.platform === 'linkedin' ? Linkedin : Youtube
                const platformColor = item.platform === 'instagram' ? '#e1306c' : item.platform === 'linkedin' ? '#0077b5' : '#dc2626'
                const statusColor = item.status === 'published' ? '#10b981' : item.status === 'scheduled' ? '#3b82f6' : item.status === 'in_progress' ? '#f59e0b' : '#64748b'

                return (
                  <Link key={`${item.platform}-${item.id}`} href={item.href} className="block">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg transition-colors bg-white/[0.02] hover:bg-white/5">
                      <PlatformIcon className="w-4 h-4 flex-shrink-0" style={{ color: platformColor }} />
                      <p className="text-[12px] text-white/70 truncate flex-1">{item.title}</p>
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded capitalize flex-shrink-0"
                        style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}25` }}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Schedule + Competitor Intel ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ComingUp />
        <CompetitorIntel />
      </div>

      {/* ── Activity + Topics ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PostingTracker compact />
        </div>

        {/* Active Topics */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" style={{ color: '#f59e0b' }} />
              <h2 className="text-sm font-semibold text-white">Active Topics</h2>
            </div>
            <Link href="/dashboard/topics" className="flex items-center gap-1 text-[11px] transition-colors text-white/30 hover:text-white/60">
              All topics <span className="text-[10px]">&rarr;</span>
            </Link>
          </div>

          {(recentTopics ?? []).length === 0 ? (
            <p className="text-[12px] py-4 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>No active topics yet</p>
          ) : (
            <div className="space-y-1.5">
              {(recentTopics ?? []).map((topic: any) => (
                <Link key={topic.id} href="/dashboard/topics" className="block">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer bg-white/[0.02] hover:bg-white/5">
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)' }}
                    >
                      {topic.target_posts} posts
                    </span>
                    <p className="text-[12px] text-white/70 truncate flex-1">{topic.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/dashboard/topics"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[11px] transition-colors"
            style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.07)' }}
          >
            <Plus className="w-3 h-3" /> New topic
          </Link>
        </div>
      </div>

    </div>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function buildPlatformBreakdown(posts: { platform: string }[]): { platform: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const p of posts) {
    counts[p.platform] = (counts[p.platform] ?? 0) + 1
  }
  return Object.entries(counts).map(([platform, count]) => ({ platform, count }))
}
