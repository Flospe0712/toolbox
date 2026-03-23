'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Linkedin, FileText, LayoutGrid, Edit3, Eye, Clock, CheckCircle, Radio, Inbox, GripVertical, CalendarDays, Heart, MessageCircle, ThumbsUp, Link2, Unlink, Loader2, Image as ImageIcon, Globe, MoreHorizontal, Send, Repeat2, MessageSquare, Play, CalendarClock, ChevronDown, Film } from 'lucide-react'
import type { SocialPost, LinkedInPostType, SocialPostStatus } from '@/lib/types'
import LinkedInFeedPreview from '@/components/linkedin-feed-preview'
import ProfileAvatar from '@/components/profile-avatar'
import PlatformCalendar from '@/components/platform-calendar'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getMediaUrl(file: { url?: string | null; storage_path?: string | null }): string | null {
  if (file.url) return file.url
  if (file.storage_path) return `${SUPABASE_URL}/storage/v1/object/public/social-media/${file.storage_path}`
  return null
}

const STATUS_BADGE_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  in_progress: { label: 'In Progress', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  ready_to_create: { label: 'Ready to Create', bg: 'rgba(236,72,153,0.15)', color: '#ec4899' },
  ready: { label: 'Ready', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  scheduled: { label: 'Scheduled', bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' },
  published: { label: 'Published', bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  backlog: { label: 'Backlog', bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  draft: { label: 'Draft', bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' },
}

function MiniLinkedInCard({ post, badge, onClick }: { post: SocialPost; badge?: React.ReactNode; onClick: () => void }) {
  const media = post.media_files || []
  const first = media[0]
  const firstUrl = first ? getMediaUrl(first) : null
  const content = post.body || post.caption || ''
  const dateStr = post.published_at || post.scheduled_at || post.created_at
  const date = new Date(dateStr)
  const statusBadge = STATUS_BADGE_STYLES[post.status]

  return (
    <div
      onClick={onClick}
      className="group rounded-lg overflow-hidden cursor-pointer transition-all hover:border-white/15"
      style={{ background: '#1b1f23', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start justify-between p-2.5 pb-1.5">
        <div className="flex items-center gap-2">
          <ProfileAvatar size={28} fallback="U" fallbackTextClass="text-[10px]" fallbackTextColor="text-white" style={{ background: '#0077b5' }} />
          <div>
            <p className="text-[11px] font-semibold text-white/80">Your Name</p>
            <div className="flex items-center gap-1">
              <p className="text-[9px] text-white/25">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <span className="text-white/15">&middot;</span>
              <Globe className="w-2 h-2 text-white/25" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {badge}
          {!badge && statusBadge && post.status !== 'published' && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: statusBadge.bg, color: statusBadge.color }}>{statusBadge.label}</span>
          )}
        </div>
      </div>

      {content ? (
        <div className="px-2.5 pb-1.5">
          <p className="text-[11px] text-white/60 leading-relaxed whitespace-pre-line line-clamp-3">{content}</p>
        </div>
      ) : (
        <div className="px-2.5 pb-1.5">
          <p className="text-[11px] text-white/40 italic line-clamp-2">{post.title}</p>
        </div>
      )}

      {firstUrl && first && (
        <div className="relative">
          {first.file_type === 'image' ? (
            <img src={firstUrl} alt="" className="w-full object-cover" style={{ maxHeight: 140 }} />
          ) : first.file_type === 'video' ? (
            <div className="relative">
              <video src={firstUrl} muted className="w-full object-cover" style={{ maxHeight: 140 }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                </div>
              </div>
            </div>
          ) : first.file_type === 'pdf' ? (
            <div className="flex items-center gap-2 px-3 py-2 mx-2.5 mb-1.5 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <FileText className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <span className="text-[10px] text-white/40 truncate">{first.filename || 'Document'}</span>
            </div>
          ) : null}
          {media.length > 1 && (
            <div className="absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.8)' }}>1/{media.length}</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-1.5 py-1 border-t border-white/5">
        {[
          { icon: ThumbsUp, label: 'Like' },
          { icon: MessageSquare, label: 'Comment' },
          { icon: Repeat2, label: 'Repost' },
          { icon: Send, label: 'Send' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1 px-2 py-1 text-white/20">
            <Icon className="w-3 h-3" />
            <span className="text-[9px]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TYPE_CONFIG: Record<LinkedInPostType, { label: string; icon: React.ReactNode; color: string }> = {
  post: { label: 'Post', icon: <Edit3 className="w-3.5 h-3.5" />, color: '#0077b5' },
  article: { label: 'Article', icon: <FileText className="w-3.5 h-3.5" />, color: '#00a0dc' },
  carousel: { label: 'Carousel', icon: <LayoutGrid className="w-3.5 h-3.5" />, color: '#0e76a8' },
}

type StatusFilter = 'in_progress' | 'ready_to_create' | 'ready' | 'scheduled' | 'published' | 'backlog'

const STATUS_TABS: { id: StatusFilter; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'in_progress',     label: 'In Progress',      icon: <Clock className="w-3.5 h-3.5" />, color: '#f59e0b' },
  { id: 'ready_to_create', label: 'Ready to Create',  icon: <Film className="w-3.5 h-3.5" />, color: '#ec4899' },
  { id: 'ready',           label: 'Ready',            icon: <CheckCircle className="w-3.5 h-3.5" />, color: '#38bdf8' },
  { id: 'scheduled',       label: 'Scheduled',        icon: <CalendarClock className="w-3.5 h-3.5" />, color: '#818cf8' },
  { id: 'published',       label: 'Published',        icon: <Radio className="w-3.5 h-3.5" />, color: '#22c55e' },
  { id: 'backlog',         label: 'Backlog',          icon: <Inbox className="w-3.5 h-3.5" />, color: '#a78bfa' },
]

export default function LinkedInPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<LinkedInPostType | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState<LinkedInPostType>('post')
  const [creating, setCreating] = useState(false)
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
      ? '/api/social?platform=linkedin'
      : `/api/social?platform=linkedin&type=${activeType}`
    const res = await fetch(url)
    const data = await res.json()
    setPosts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [activeType])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  useEffect(() => {
    if (statusFilter === 'published') {
      setLoadingMetricool(true)
      fetch(`/api/metricool?endpoint=linkedin_posts&from=2024-01-01T00:00:00&to=${new Date().toISOString().split('.')[0]}`)
        .then(r => r.json())
        .then((data) => {
          const all = data?.data || (Array.isArray(data) ? data : [])
          setMetricoolPosts(Array.isArray(all) ? all : [])
          setLoadingMetricool(false)
        })
        .catch(() => { setMetricoolPosts([]); setLoadingMetricool(false) })
    }
  }, [statusFilter])

  const openCreate = (type: LinkedInPostType) => {
    setCreateType(type)
    setForm({ title: '', caption: '', notes: '' })
    setShowCreate(true)
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setCreating(true)
    await fetch('/api/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, platform: 'linkedin', type: createType, caption: form.caption || null, hashtags: [], notes: form.notes || null }),
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
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx) }
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return }
    const items = [...filteredPosts]
    const [moved] = items.splice(dragIdx, 1)
    items.splice(idx, 0, moved)
    setDragIdx(null); setDragOverIdx(null)
    reorder(items)
  }
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null) }

  const isDraggable = statusFilter === 'in_progress'
  const typeKeys = Object.keys(TYPE_CONFIG) as LinkedInPostType[]
  const statusFiltered = posts.filter(p => p.status === statusFilter)
  const filteredPosts = activeType === 'all' ? statusFiltered : statusFiltered.filter(p => p.type === activeType)
  const unlinkedPosts = filteredPosts.filter(p => !p.metricool_post_id)
  const linkedPosts = filteredPosts.filter(p => !!p.metricool_post_id)

  return (
    <div className="min-h-screen p-8" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0077b5' }}>
            <Linkedin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">LinkedIn</h1>
            <p className="text-xs text-white/40">{posts.length} piece{posts.length !== 1 ? 's' : ''} of content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalendar(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{
              background: showCalendar ? 'rgba(0,119,181,0.12)' : 'rgba(255,255,255,0.05)',
              color: showCalendar ? '#0077b5' : 'rgba(255,255,255,0.45)',
              border: showCalendar ? '1px solid rgba(0,119,181,0.25)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Calendar
          </button>
          <button
            onClick={() => setShowFeedPreview(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(0,119,181,0.12)', color: '#0077b5', border: '1px solid rgba(0,119,181,0.25)' }}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview Feed
          </button>
          <div className="relative" ref={newMenuRef}>
            <button
              onClick={() => setShowNewMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: '#0077b5', color: '#fff' }}
            >
              <Plus className="w-3.5 h-3.5" />
              New
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>
            {showNewMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl py-1.5 z-50 shadow-xl" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
                {typeKeys.map(type => {
                  const cfg = TYPE_CONFIG[type]
                  return (
                    <button key={type} onClick={() => { openCreate(type); setShowNewMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors">
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
            <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all"
              style={{
                background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: active ? tab.color : 'rgba(255,255,255,0.3)',
                border: active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
              }}>
              {tab.icon}
              {tab.label}
              {count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono ml-0.5"
                  style={{ background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', color: active ? tab.color : 'rgba(255,255,255,0.2)' }}>
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
          <PlatformCalendar platform="linkedin" posts={posts} />
        </div>
      )}

      {/* Type filters */}
      <div className="flex items-center gap-1.5 mb-6">
        <button onClick={() => setActiveType('all')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: activeType === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: activeType === 'all' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
            border: activeType === 'all' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
          }}>
          All ({statusFiltered.length})
        </button>
        {typeKeys.map(type => {
          const cfg = TYPE_CONFIG[type]
          const count = statusFiltered.filter(p => p.type === type).length
          return (
            <button key={type} onClick={() => setActiveType(type)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeType === type ? `${cfg.color}18` : 'transparent',
                color: activeType === type ? cfg.color : 'rgba(255,255,255,0.35)',
                border: activeType === type ? `1px solid ${cfg.color}30` : '1px solid transparent',
              }}>
              {cfg.icon}
              {cfg.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: '#111' }} />
          ))}
        </div>
      ) : statusFilter === 'published' ? (
        <div className="flex flex-col gap-8">
          {unlinkedPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Unlink className="w-3.5 h-3.5 text-amber-400" />
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Unlinked Posts</h3>
                <span className="text-[10px] text-amber-400/60 font-mono">({unlinkedPosts.length})</span>
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
                {unlinkedPosts.map((post) => (
                  <MiniLinkedInCard key={post.id} post={post} onClick={() => router.push(`/dashboard/linkedin/${post.id}`)}
                    badge={<span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400"><Unlink className="w-2.5 h-2.5" />Unlinked</span>} />
                ))}
              </div>
            </div>
          )}

          {linkedPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Linked Posts</h3>
                <span className="text-[10px] text-emerald-400/60 font-mono">({linkedPosts.length})</span>
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
                {linkedPosts.map((post) => (
                  <MiniLinkedInCard key={post.id} post={post} onClick={() => router.push(`/dashboard/linkedin/${post.id}`)} />
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Linkedin className="w-3.5 h-3.5 text-white/50" />
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">Historical Posts</h3>
              {loadingMetricool && <Loader2 className="w-3 h-3 text-white/30 animate-spin" />}
              {!loadingMetricool && <span className="text-[10px] text-white/30 font-mono">({metricoolPosts.length})</span>}
            </div>
            {loadingMetricool ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: '#111' }} />
                ))}
              </div>
            ) : metricoolPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-white/30 text-xs">No historical posts from Metricool</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
                {[...metricoolPosts].sort((a: any, b: any) => {
                  const dateA = a.publishedAt?.dateTime || a.publicationDate?.dateTime || ''
                  const dateB = b.publishedAt?.dateTime || b.publicationDate?.dateTime || ''
                  return new Date(dateB).getTime() - new Date(dateA).getTime()
                }).map((mp: any, i: number) => {
                  const pubDate = mp.publishedAt?.dateTime || mp.publicationDate?.dateTime
                  const likes = mp.metrics?.likes ?? mp.likes ?? 0
                  const comments = mp.metrics?.comments ?? mp.comments ?? 0
                  const text = mp.text || mp.caption || ''
                  const mediaUrl = mp.mediaUrl || mp.imageUrl || null
                  return (
                    <div key={`metricool-li-${i}`} className="group rounded-xl overflow-hidden transition-all hover:border-white/10" style={{ background: '#1b1f23', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center gap-2.5 p-3 pb-2">
                        <ProfileAvatar size={32} fallback="U" fallbackTextClass="text-xs" fallbackTextColor="text-white" style={{ background: '#0077b5' }} />
                        <div>
                          <p className="text-[12px] font-semibold text-white/80">Your Name</p>
                          <p className="text-[10px] text-white/25">{pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '\u2014'}</p>
                        </div>
                      </div>
                      {text && <div className="px-3 pb-2"><p className="text-[12px] text-white/60 leading-relaxed line-clamp-4">{text}</p></div>}
                      {mediaUrl && <img src={mediaUrl} alt="" className="w-full object-cover" style={{ maxHeight: 200 }} />}
                      <div className="px-3 py-2 flex items-center gap-4 border-t border-white/5">
                        <div className="flex items-center gap-1 text-[11px] text-white/30"><ThumbsUp className="w-3 h-3" /><span>{likes}</span></div>
                        <div className="flex items-center gap-1 text-[11px] text-white/30"><MessageCircle className="w-3 h-3" /><span>{comments}</span></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {filteredPosts.length === 0 && metricoolPosts.length === 0 && !loadingMetricool && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#111' }}><Linkedin className="w-6 h-6 text-white/20" /></div>
              <p className="text-white/40 text-sm">No published LinkedIn content yet</p>
            </div>
          )}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#111' }}><Linkedin className="w-6 h-6 text-white/20" /></div>
          <p className="text-white/40 text-sm">No {statusFilter.replace('_', ' ')} LinkedIn content</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {filteredPosts.map((post, idx) => {
            const isDragOver = dragOverIdx === idx && dragIdx !== idx
            return (
              <div key={post.id} draggable={isDraggable}
                onDragStart={isDraggable ? () => handleDragStart(idx) : undefined}
                onDragOver={isDraggable ? (e) => handleDragOver(e, idx) : undefined}
                onDrop={isDraggable ? () => handleDrop(idx) : undefined}
                onDragEnd={isDraggable ? handleDragEnd : undefined}
                className="relative"
                style={{ opacity: dragIdx === idx ? 0.5 : 1, outline: isDragOver ? '2px solid rgba(255,255,255,0.2)' : 'none', borderRadius: 8 }}>
                {isDraggable && (
                  <div className="absolute top-2 left-2 cursor-grab opacity-0 hover:opacity-100 transition-opacity z-10" onMouseDown={e => e.stopPropagation()}>
                    <GripVertical className="w-3.5 h-3.5 text-white/30" />
                  </div>
                )}
                <MiniLinkedInCard post={post} onClick={() => router.push(`/dashboard/linkedin/${post.id}`)} />
              </div>
            )
          })}
        </div>
      )}

      {/* Feed Preview */}
      {showFeedPreview && <LinkedInFeedPreview posts={posts} onClose={() => setShowFeedPreview(false)} />}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ background: `${TYPE_CONFIG[createType]?.color}18`, color: TYPE_CONFIG[createType]?.color }}>
                {TYPE_CONFIG[createType]?.icon}
                New {TYPE_CONFIG[createType]?.label}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <input autoFocus type="text" placeholder="Working title..." value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20"
                onKeyDown={e => e.key === 'Enter' && handleCreate()} />
              <textarea placeholder={createType === 'article' ? 'Article introduction...' : 'Post content...'} value={form.caption}
                onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 resize-none" />
              <input type="text" placeholder="Notes (optional)..." value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.title.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40" style={{ background: '#0077b5' }}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
