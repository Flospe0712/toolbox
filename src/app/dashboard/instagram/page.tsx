'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Instagram, Film, LayoutGrid, BookImage, BookOpen, Image, Eye, Clock, CheckCircle, Radio, Inbox, GripVertical, Heart, MessageCircle, Link2, Unlink, Loader2, CalendarDays, ChevronDown } from 'lucide-react'
import type { SocialPost, InstagramPostType, SocialPostStatus, ReelFormat } from '@/lib/types'
import { REEL_FORMATS } from '@/lib/types'
import { Video, VolumeX, BookText, Clapperboard, Zap, Columns2 } from 'lucide-react'

const FORMAT_CONFIG: Record<ReelFormat, { label: string; icon: React.ReactNode; color: string }> = {
  'talking-head': { label: 'Talking Head', icon: <Video className="w-3 h-3" />, color: '#f472b6' },
  'faceless': { label: 'Faceless', icon: <VolumeX className="w-3 h-3" />, color: '#38bdf8' },
  'story-style': { label: 'Story Style', icon: <BookText className="w-3 h-3" />, color: '#fb923c' },
  'b-roll': { label: 'B-Roll', icon: <Clapperboard className="w-3 h-3" />, color: '#4ade80' },
  'trend': { label: 'Trend', icon: <Zap className="w-3 h-3" />, color: '#facc15' },
  'split-screen': { label: 'Split Screen', icon: <Columns2 className="w-3 h-3" />, color: '#c084fc' },
}
import InstagramFeedPreview from '@/components/instagram-feed-preview'
import PlatformCalendar from '@/components/platform-calendar'

const TYPE_CONFIG: Record<InstagramPostType, { label: string; icon: React.ReactNode; color: string }> = {
  reel: { label: 'Reel', icon: <Film className="w-3.5 h-3.5" />, color: '#a855f7' },
  carousel: { label: 'Carousel', icon: <LayoutGrid className="w-3.5 h-3.5" />, color: '#3b82f6' },
  thread_carousel: { label: 'Thread Carousel', icon: <BookImage className="w-3.5 h-3.5" />, color: '#06b6d4' },
  story: { label: 'Story', icon: <BookOpen className="w-3.5 h-3.5" />, color: '#f59e0b' },
  post: { label: 'Post', icon: <Image className="w-3.5 h-3.5" />, color: '#6b7280' },
}

const STATUS_STYLES: Record<SocialPostStatus, string> = {
  draft: 'bg-white/5 text-white/40',
  in_progress: 'bg-amber-500/10 text-amber-400',
  ready_to_create: 'bg-pink-500/10 text-pink-400',
  ready: 'bg-emerald-500/10 text-emerald-400',
  scheduled: 'bg-sky-500/10 text-sky-400',
  published: 'bg-violet-500/10 text-violet-400',
  backlog: 'bg-purple-500/10 text-purple-400',
}

const STATUS_LABELS: Record<SocialPostStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  ready_to_create: 'Ready to Create',
  ready: 'Ready',
  scheduled: 'Scheduled',
  published: 'Published',
  backlog: 'Backlog',
}

type StatusFilter = 'in_progress' | 'ready_to_create' | 'ready' | 'published' | 'backlog'

const STATUS_TABS: { id: StatusFilter; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'in_progress',  label: 'In Progress',    icon: <Clock className="w-3.5 h-3.5" />, color: '#f59e0b' },
  { id: 'ready_to_create', label: 'Ready to Create', icon: <Film className="w-3.5 h-3.5" />, color: '#ec4899' },
  { id: 'ready',         label: 'Ready',          icon: <CheckCircle className="w-3.5 h-3.5" />, color: '#38bdf8' },
  { id: 'published',   label: 'Published',   icon: <Radio className="w-3.5 h-3.5" />, color: '#22c55e' },
  { id: 'backlog',     label: 'Backlog',     icon: <Inbox className="w-3.5 h-3.5" />, color: '#a78bfa' },
]

export default function InstagramPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<InstagramPostType | 'all'>('all')
  const [activeFormat, setActiveFormat] = useState<ReelFormat | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState<InstagramPostType>('reel')
  const [creating, setCreating] = useState(false)
  const [createFormat, setCreateFormat] = useState<ReelFormat | null>(null)
  const [form, setForm] = useState({ title: '', caption: '', notes: '' })
  const [showFeedPreview, setShowFeedPreview] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('in_progress')
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [metricoolPosts, setMetricoolPosts] = useState<any[]>([])
  const [loadingMetricool, setLoadingMetricool] = useState(false)
  const [showNewMenu, setShowNewMenu] = useState(false)
  const newMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) setShowNewMenu(false)
    }
    if (showNewMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showNewMenu])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const url = activeType === 'all'
      ? '/api/social?platform=instagram'
      : `/api/social?platform=instagram&type=${activeType}`
    const res = await fetch(url)
    const data = await res.json()
    setPosts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [activeType])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // Fetch historical posts from Metricool when viewing published tab
  useEffect(() => {
    if (statusFilter === 'published') {
      setLoadingMetricool(true)
      Promise.all([
        fetch(`/api/metricool?endpoint=instagram_posts&from=2024-01-01T00:00:00&to=${new Date().toISOString().split('.')[0]}`).then(r => r.json()),
        fetch(`/api/metricool?endpoint=instagram_reels&from=2024-01-01T00:00:00&to=${new Date().toISOString().split('.')[0]}`).then(r => r.json()),
      ]).then(([postsData, reelsData]) => {
        const all = [...(postsData?.data || postsData || []), ...(reelsData?.data || reelsData || [])]
        setMetricoolPosts(Array.isArray(all) ? all : [])
        setLoadingMetricool(false)
      }).catch(() => {
        setMetricoolPosts([])
        setLoadingMetricool(false)
      })
    }
  }, [statusFilter])

  const openCreate = (type: InstagramPostType) => {
    setCreateType(type)
    setCreateFormat(null)
    setForm({ title: '', caption: '', notes: '' })
    setShowCreate(true)
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setCreating(true)
    await fetch('/api/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, platform: 'instagram', type: createType, format: createType === 'reel' ? createFormat : null, caption: form.caption || null, notes: form.notes || null }),
    })
    setCreating(false)
    setShowCreate(false)
    fetchPosts()
  }

  const reorder = async (newOrder: SocialPost[]) => {
    setPosts(prev => {
      const otherPosts = prev.filter(p => !newOrder.find(n => n.id === p.id))
      return [...newOrder, ...otherPosts]
    })
    await fetch('/api/social/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: newOrder.map(p => p.id) }),
    })
  }

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) {
      setDragIdx(null)
      setDragOverIdx(null)
      return
    }
    const items = [...filteredPosts]
    const [moved] = items.splice(dragIdx, 1)
    items.splice(idx, 0, moved)
    setDragIdx(null)
    setDragOverIdx(null)
    reorder(items)
  }
  const handleDragEnd = () => {
    setDragIdx(null)
    setDragOverIdx(null)
  }

  const isDraggable = statusFilter === 'in_progress'

  const typeKeys = Object.keys(TYPE_CONFIG) as InstagramPostType[]
  const statusFiltered = posts.filter(p => p.status === statusFilter)
  const typeFiltered = activeType === 'all' ? statusFiltered : statusFiltered.filter(p => p.type === activeType)
  const filteredPosts = activeFormat === 'all' ? typeFiltered : typeFiltered.filter(p => p.format === activeFormat)
  const showFormatFilter = activeType === 'all' || activeType === 'reel'
  const formatKeys = Object.keys(FORMAT_CONFIG) as ReelFormat[]

  // Published section: split into unlinked dashboard posts and historical Metricool posts
  const unlinkedPosts = filteredPosts.filter(p => !p.metricool_post_id)
  const linkedPosts = filteredPosts.filter(p => !!p.metricool_post_id)

  const handleLinkPost = async (postId: string) => {
    // Mark as linked by setting a placeholder metricool_post_id
    await fetch(`/api/social/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metricool_post_id: -1 }),
    })
    fetchPosts()
  }

  return (
    <div className="min-h-screen p-8" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Instagram</h1>
            <p className="text-xs text-white/40">{posts.length} piece{posts.length !== 1 ? 's' : ''} of content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalendar(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{
              background: showCalendar ? 'rgba(225,48,108,0.12)' : 'rgba(255,255,255,0.05)',
              color: showCalendar ? '#e1306c' : 'rgba(255,255,255,0.45)',
              border: showCalendar ? '1px solid rgba(225,48,108,0.25)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Calendar
          </button>
          <button
            onClick={() => setShowFeedPreview(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, rgba(131,58,180,0.15), rgba(253,29,29,0.15), rgba(252,176,69,0.15))', color: '#e1306c', border: '1px solid rgba(225,48,108,0.2)' }}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview Feed
          </button>

          {/* New content dropdown */}
          <div className="relative" ref={newMenuRef}>
            <button
              onClick={() => setShowNewMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: '#dc2626', color: '#fff' }}
            >
              <Plus className="w-3.5 h-3.5" />
              New
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>
            {showNewMenu && (
              <div
                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl py-1.5 z-50 shadow-xl"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {typeKeys.filter(t => t !== 'post').map(type => {
                  const cfg = TYPE_CONFIG[type]
                  return (
                    <button
                      key={type}
                      onClick={() => { openCreate(type); setShowNewMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto">
        {STATUS_TABS.map(tab => {
          const active = statusFilter === tab.id
          const count = posts.filter(p => p.status === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all"
              style={{
                background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: active ? tab.color : 'rgba(255,255,255,0.3)',
                border: active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
              }}
            >
              {tab.icon}
              {tab.label}
              {count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono ml-0.5"
                  style={{
                    background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                    color: active ? tab.color : 'rgba(255,255,255,0.2)',
                  }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Platform Calendar */}
      {showCalendar && (
        <div className="mb-4">
          <PlatformCalendar platform="instagram" posts={posts} />
        </div>
      )}

      {/* Type & Format filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <select
            value={activeType}
            onChange={e => { setActiveType(e.target.value as InstagramPostType | 'all'); if (e.target.value !== 'reel') setActiveFormat('all') }}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium outline-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', color: activeType === 'all' ? 'rgba(255,255,255,0.6)' : (TYPE_CONFIG[activeType as InstagramPostType]?.color || 'rgba(255,255,255,0.6)'), border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="all">All Types ({statusFiltered.length})</option>
            {typeKeys.map(type => {
              const count = statusFiltered.filter(p => p.type === type).length
              return <option key={type} value={type}>{TYPE_CONFIG[type].label} ({count})</option>
            })}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>

        {showFormatFilter && (
          <div className="relative">
            <select
              value={activeFormat}
              onChange={e => setActiveFormat(e.target.value as ReelFormat | 'all')}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium outline-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', color: activeFormat === 'all' ? 'rgba(255,255,255,0.6)' : (FORMAT_CONFIG[activeFormat as ReelFormat]?.color || 'rgba(255,255,255,0.6)'), border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <option value="all">All Formats</option>
              {formatKeys.map(fmt => {
                const count = typeFiltered.filter(p => p.format === fmt).length
                return <option key={fmt} value={fmt}>{FORMAT_CONFIG[fmt].label} ({count})</option>
              })}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl animate-pulse" style={{ background: '#111' }} />
          ))}
        </div>
      ) : statusFilter === 'published' ? (
        /* Published view: Unlinked + Linked + Historical */
        <div className="flex flex-col gap-8">
          {/* Unlinked dashboard posts */}
          {unlinkedPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Unlink className="w-3.5 h-3.5 text-amber-400" />
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Unlinked Posts</h3>
                <span className="text-[10px] text-amber-400/60 font-mono">({unlinkedPosts.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {unlinkedPosts.map((post) => {
                  const cfg = TYPE_CONFIG[post.type as InstagramPostType]
                  return (
                    <div
                      key={post.id}
                      onClick={() => router.push(`/dashboard/instagram/${post.id}`)}
                      className="group rounded-xl p-4 flex flex-col gap-3 transition-all hover:border-amber-500/30 cursor-pointer relative"
                      style={{ background: '#111', border: '1px solid rgba(245,158,11,0.2)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: `${cfg?.color || '#888'}15`, color: cfg?.color || '#888' }}>
                            {cfg?.icon}
                            {cfg?.label || post.type}
                          </span>
                          {post.type === 'reel' && post.format && FORMAT_CONFIG[post.format] && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium" style={{ background: `${FORMAT_CONFIG[post.format].color}15`, color: FORMAT_CONFIG[post.format].color }}>
                              {FORMAT_CONFIG[post.format].icon}
                              {FORMAT_CONFIG[post.format].label}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium bg-amber-500/10 text-amber-400">
                          <Unlink className="w-3 h-3" />
                          Unlinked
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-white/85 leading-snug group-hover:text-white transition-colors line-clamp-2">{post.title}</h3>
                      {post.caption && <p className="text-xs text-white/30 line-clamp-2 leading-relaxed">{post.caption}</p>}
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[10px] text-white/20">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLinkPost(post.id) }}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-medium transition-all hover:bg-amber-500/20"
                          style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.08)' }}
                        >
                          <Link2 className="w-3 h-3" />
                          Mark Linked
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Linked dashboard posts */}
          {linkedPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Linked Posts</h3>
                <span className="text-[10px] text-emerald-400/60 font-mono">({linkedPosts.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {linkedPosts.map((post) => {
                  const cfg = TYPE_CONFIG[post.type as InstagramPostType]
                  return (
                    <div
                      key={post.id}
                      onClick={() => router.push(`/dashboard/instagram/${post.id}`)}
                      className="group rounded-xl p-4 flex flex-col gap-3 transition-all hover:border-white/10 cursor-pointer"
                      style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: `${cfg?.color || '#888'}15`, color: cfg?.color || '#888' }}>
                            {cfg?.icon}
                            {cfg?.label || post.type}
                          </span>
                          {post.type === 'reel' && post.format && FORMAT_CONFIG[post.format] && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium" style={{ background: `${FORMAT_CONFIG[post.format].color}15`, color: FORMAT_CONFIG[post.format].color }}>
                              {FORMAT_CONFIG[post.format].icon}
                              {FORMAT_CONFIG[post.format].label}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-violet-500/10 text-violet-400">Published</span>
                      </div>
                      <h3 className="text-sm font-medium text-white/85 leading-snug group-hover:text-white transition-colors line-clamp-2">{post.title}</h3>
                      {post.caption && <p className="text-xs text-white/30 line-clamp-2 leading-relaxed">{post.caption}</p>}
                      <div className="mt-auto">
                        <span className="text-[10px] text-white/20">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Historical Metricool posts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Instagram className="w-3.5 h-3.5 text-white/50" />
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">Historical Posts</h3>
              {loadingMetricool && <Loader2 className="w-3 h-3 text-white/30 animate-spin" />}
              {!loadingMetricool && <span className="text-[10px] text-white/30 font-mono">({metricoolPosts.length})</span>}
            </div>
            {loadingMetricool ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg animate-pulse" style={{ background: '#111' }} />
                ))}
              </div>
            ) : metricoolPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-white/30 text-xs">No historical posts from Metricool</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {[...metricoolPosts]
                  .sort((a: any, b: any) => {
                    const dateA = a.publishedAt?.dateTime || a.publicationDate?.dateTime || ''
                    const dateB = b.publishedAt?.dateTime || b.publicationDate?.dateTime || ''
                    return new Date(dateB).getTime() - new Date(dateA).getTime()
                  })
                  .map((mp: any, i: number) => {
                    const pubDate = mp.publishedAt?.dateTime || mp.publicationDate?.dateTime
                    const likes = mp.metrics?.likes ?? mp.likes ?? 0
                    const comments = mp.metrics?.comments ?? mp.comments ?? 0
                    const mediaUrl = mp.mediaUrl || mp.imageUrl || mp.thumbnailUrl || null
                    const text = mp.text || mp.caption || ''
                    const isReel = mp.type === 'REEL' || mp.mediaType === 'VIDEO' || !!mp.videoUrl
                    return (
                      <div key={`metricool-${i}`} className="group rounded-lg overflow-hidden transition-all hover:ring-1 hover:ring-white/10" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="aspect-square relative" style={{ background: '#0a0a0a' }}>
                          {mediaUrl ? (
                            <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white/8 text-[10px] font-medium text-center px-2 line-clamp-3">{text.slice(0, 80)}</span>
                            </div>
                          )}
                          {isReel && (
                            <div className="absolute top-1.5 right-1.5">
                              <Film className="w-3.5 h-3.5 text-white/70" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <div className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-white" fill="white" />
                              <span className="text-[11px] font-bold text-white">{likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5 text-white" fill="white" />
                              <span className="text-[11px] font-bold text-white">{comments}</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-2 py-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-white/25">
                            {pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '\u2014'}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-white/30">
                            <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" /> {likes}</span>
                            <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> {comments}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {filteredPosts.length === 0 && metricoolPosts.length === 0 && !loadingMetricool && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#111' }}>
                <Instagram className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/40 text-sm">No published content yet</p>
            </div>
          )}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#111' }}>
            <Instagram className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">No {statusFilter.replace('_', ' ')}{activeType !== 'all' ? ` ${TYPE_CONFIG[activeType]?.label.toLowerCase()}` : ''} content</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPosts.map((post, idx) => {
            const cfg = TYPE_CONFIG[post.type as InstagramPostType]
            const isDragOver = dragOverIdx === idx && dragIdx !== idx
            return (
              <div
                key={post.id}
                draggable={isDraggable}
                onDragStart={isDraggable ? () => handleDragStart(idx) : undefined}
                onDragOver={isDraggable ? (e) => handleDragOver(e, idx) : undefined}
                onDrop={isDraggable ? () => handleDrop(idx) : undefined}
                onDragEnd={isDraggable ? handleDragEnd : undefined}
                onClick={() => router.push(`/dashboard/instagram/${post.id}`)}
                className="group rounded-xl p-4 flex flex-col gap-3 transition-all hover:border-white/10 cursor-pointer relative"
                style={{
                  background: '#111',
                  border: isDragOver ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  opacity: dragIdx === idx ? 0.5 : 1,
                }}
              >
                {isDraggable && (
                  <div className="absolute top-2 left-2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10" onMouseDown={e => e.stopPropagation()}>
                    <GripVertical className="w-3.5 h-3.5 text-white/20" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: `${cfg?.color || '#888'}15`, color: cfg?.color || '#888' }}>
                      {cfg?.icon}
                      {cfg?.label || post.type}
                    </span>
                    {post.type === 'reel' && post.format && FORMAT_CONFIG[post.format] && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium" style={{ background: `${FORMAT_CONFIG[post.format].color}15`, color: FORMAT_CONFIG[post.format].color }}>
                        {FORMAT_CONFIG[post.format].icon}
                        {FORMAT_CONFIG[post.format].label}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${STATUS_STYLES[post.status] || STATUS_STYLES.draft}`}>
                    {STATUS_LABELS[post.status]}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white/85 leading-snug group-hover:text-white transition-colors line-clamp-2">{post.title}</h3>
                {post.caption && <p className="text-xs text-white/30 line-clamp-2 leading-relaxed">{post.caption}</p>}
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] text-white/20">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Feed Preview */}
      {showFeedPreview && (
        <InstagramFeedPreview posts={posts} historicalPosts={metricoolPosts} onClose={() => setShowFeedPreview(false)} />
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ background: `${TYPE_CONFIG[createType]?.color}18`, color: TYPE_CONFIG[createType]?.color }}
              >
                {TYPE_CONFIG[createType]?.icon}
                New {TYPE_CONFIG[createType]?.label}
              </span>
            </div>

            {createType === 'reel' && (
              <div className="flex items-center gap-1.5">
                {REEL_FORMATS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setCreateFormat(f.value)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                    style={{
                      background: createFormat === f.value ? '#a855f718' : 'rgba(255,255,255,0.03)',
                      color: createFormat === f.value ? '#a855f7' : 'rgba(255,255,255,0.3)',
                      border: createFormat === f.value ? '1px solid #a855f730' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <input
                autoFocus
                type="text"
                placeholder="Working title..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20"
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <textarea
                placeholder="Caption (optional)..."
                value={form.caption}
                onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 resize-none"
              />
              <input
                type="text"
                placeholder="Notes (optional)..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.title.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40"
                style={{ background: '#dc2626' }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
