'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Trash2, Upload, X, Instagram, Film, LayoutGrid, BookImage, BookOpen, Image, GripVertical, Sparkles, Loader2, Check, Music } from 'lucide-react'
import type { SocialPost, SocialMediaFile, SocialPostStatus, InstagramPostType, ReelFormat } from '@/lib/types'
import { REEL_FORMATS } from '@/lib/types'
import { ContentScorer } from '@/components/content-scorer'
import { MetricoolScheduler } from '@/components/metricool-scheduler'
import { RemixSources } from '@/components/remix-sources'

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  reel: { label: 'Reel', color: '#a855f7' },
  carousel: { label: 'Carousel', color: '#3b82f6' },
  thread_carousel: { label: 'Thread Carousel', color: '#06b6d4' },
  story: { label: 'Story', color: '#f59e0b' },
  post: { label: 'Post', color: '#6b7280' },
}

const STATUSES: { value: SocialPostStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready_to_create', label: 'Ready to Create' },
  { value: 'ready', label: 'Ready' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'backlog', label: 'Backlog' },
]

export default function InstagramPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<SocialPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Editable fields
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [script, setScript] = useState('')
  const [soundSong, setSoundSong] = useState('')
  const [textOverlay, setTextOverlay] = useState('')
  const [format, setFormat] = useState<ReelFormat | null>(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<SocialPostStatus>('draft')
  const [scheduledAt, setScheduledAt] = useState('')
  const [targetDate, setTargetDate] = useState('')


  useEffect(() => {
    fetch(`/api/social/${id}`)
      .then(r => r.json())
      .then(data => {
        setPost(data)
        setTitle(data.title || '')
        setCaption(data.caption || '')
        setScript(data.script || '')
        setSoundSong(data.sound_song || '')
        setTextOverlay(data.text_overlay || '')
        setFormat(data.format || null)
        setNotes(data.notes || '')
        setStatus(data.status || 'draft')
        setScheduledAt(data.scheduled_at ? data.scheduled_at.slice(0, 16) : '')
        setTargetDate(data.target_date || '')
        setLoading(false)
      })
  }, [id])


  const save = async () => {
    setSaving(true)
    await fetch(`/api/social/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, caption: caption || null, script: script || null, sound_song: soundSong || null, text_overlay: textOverlay || null, format: format || null, notes: notes || null, status, scheduled_at: scheduledAt || null, target_date: targetDate || null }),
    })
    setSaving(false)
  }

  const deletePost = async () => {
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    await fetch(`/api/social/${id}`, { method: 'DELETE' })
    router.push('/dashboard/instagram')
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('order_index', String((post?.media_files?.length || 0)))
    const res = await fetch(`/api/social/${id}/media`, { method: 'POST', body: fd })
    if (res.ok) {
      const newFile = await res.json()
      setPost(p => p ? { ...p, media_files: [...(p.media_files || []), newFile] } : p)
    }
    setUploading(false)
  }

  const deleteFile = async (fileId: string) => {
    await fetch(`/api/social/${id}/media?file_id=${fileId}`, { method: 'DELETE' })
    setPost(p => p ? { ...p, media_files: (p.media_files || []).filter(f => f.id !== fileId) } : p)
  }

  const generateCaption = async () => {
    setGeneratingCaption(true)
    try {
      const res = await fetch(`/api/social/${id}/generate-caption`, { method: 'POST' })
      const data = await res.json()
      if (data.caption) {
        setCaption(data.caption)
        // Auto-save after generating
        setTimeout(save, 200)
      }
    } catch (err) {
      console.error('Failed to generate caption:', err)
    }
    setGeneratingCaption(false)
  }


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d0d' }}>
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  )

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d0d' }}>
      <p className="text-white/40">Post not found</p>
    </div>
  )

  const cfg = TYPE_CONFIG[post.type] || { label: post.type, color: '#888' }
  const hasContent = !!(post?.media_files?.length || script.trim() || notes.trim())

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto" style={{ background: '#0d0d0d' }}>
      {/* Back */}
      <button
        onClick={() => router.push('/dashboard/instagram')}
        className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Instagram
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={save}
            className="flex-1 bg-transparent text-xl font-semibold text-white/90 outline-none border-b border-transparent hover:border-white/10 focus:border-white/20 pb-0.5 transition-colors"
            placeholder="Post title..."
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{ background: `${cfg.color}18`, color: cfg.color }}
          >
            {cfg.label}
          </span>
          <button
            onClick={deletePost}
            disabled={deleting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status + Schedule */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={status}
          onChange={e => { setStatus(e.target.value as SocialPostStatus); setTimeout(save, 100) }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-white/20"
        >
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {(status === 'scheduled') && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
            onBlur={save}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 outline-none focus:border-white/20"
          />
        )}
        {status !== 'scheduled' && status !== 'published' && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">Target</span>
            <input
              type="date"
              value={targetDate}
              onChange={e => { setTargetDate(e.target.value); setTimeout(save, 100) }}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/50 outline-none focus:border-white/20"
            />
          </div>
        )}
        <button
          onClick={save}
          disabled={saving}
          className="ml-auto px-4 py-2 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-40"
          style={{ background: '#dc2626' }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Caption */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Caption</label>
          <button
            onClick={generateCaption}
            disabled={generatingCaption || !hasContent}
            className="flex items-center gap-1 text-[10px] font-medium text-white/30 hover:text-white/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {generatingCaption ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Auto-caption
          </button>
        </div>
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          onBlur={save}
          rows={5}
          placeholder="Write your caption here..."
          className="w-full bg-transparent text-sm text-white/80 placeholder-white/20 outline-none resize-none leading-relaxed"
        />
      </div>

      {/* AI Scorer */}
      {caption.trim() && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
          <ContentScorer
            content={caption}
            type={post.type === 'reel' ? 'reel_script' : 'caption'}
            label={post.type === 'reel' ? 'Score this reel script' : 'Score this caption'}
          />
        </div>
      )}

      {/* Reel Format Picker */}
      {post.type === 'reel' && (
        <div className="flex items-center gap-1.5 mb-4">
          {REEL_FORMATS.map(f => (
            <button
              key={f.value}
              onClick={() => { setFormat(f.value); setTimeout(save, 100) }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: format === f.value ? '#a855f718' : 'rgba(255,255,255,0.03)',
                color: format === f.value ? '#a855f7' : 'rgba(255,255,255,0.3)',
                border: format === f.value ? '1px solid #a855f730' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Faceless Reel: Sound/Song + Text Overlay */}
      {post.type === 'reel' && format === 'faceless' && (
        <>
          <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2 flex items-center gap-1.5">
              <Music className="w-3 h-3" />
              Sound / Song
            </label>
            <input
              value={soundSong}
              onChange={e => setSoundSong(e.target.value)}
              onBlur={save}
              placeholder="Song name, trending audio, or sound link..."
              className="w-full bg-transparent text-sm text-white/80 placeholder-white/20 outline-none"
            />
          </div>
          <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">On-Screen Text</label>
              <span className="text-[10px] text-white/20 font-mono">
                {textOverlay.trim() ? textOverlay.trim().split(/\s+/).length : 0} words
              </span>
            </div>
            <textarea
              value={textOverlay}
              onChange={e => setTextOverlay(e.target.value)}
              onBlur={save}
              rows={8}
              placeholder="Text that appears on screen... One line per card/segment"
              className="w-full bg-transparent text-sm text-white/80 placeholder-white/20 outline-none resize-none leading-relaxed"
              style={{ fontFamily: 'monospace', caretColor: '#a855f7' }}
            />
          </div>
        </>
      )}

      {/* Reel Script (non-faceless) */}
      {post.type === 'reel' && format !== 'faceless' && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Script</label>
            <span className="text-[10px] text-white/20 font-mono">
              {script.trim() ? script.trim().split(/\s+/).length : 0} words
            </span>
          </div>
          <textarea
            value={script}
            onChange={e => setScript(e.target.value)}
            onBlur={save}
            rows={10}
            placeholder="Write your reel script here... Use ALL CAPS for headers, [B-ROLL] for visual cues"
            className="w-full bg-transparent text-sm text-white/80 placeholder-white/20 outline-none resize-none leading-relaxed"
            style={{ fontFamily: 'monospace', caretColor: '#a855f7' }}
          />
        </div>
      )}

      {/* Media files */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
            Media Files {post.media_files?.length ? `(${post.media_files.length})` : ''}
          </label>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white/80 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
            onChange={async e => { for (const f of Array.from(e.target.files || [])) await uploadFile(f); e.target.value = '' }} />
        </div>

        {!post.media_files?.length ? (
          <div
            className="border border-dashed rounded-lg py-8 flex flex-col items-center gap-2 cursor-pointer hover:border-white/15 transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-5 h-5 text-white/20" />
            <p className="text-xs text-white/25">Click or drag files here</p>
            <p className="text-[10px] text-white/15">Images + videos supported</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {(post.media_files || []).sort((a, b) => a.order_index - b.order_index).map((file, idx) => (
              <div key={file.id} className="relative rounded-lg overflow-hidden group aspect-square" style={{ background: '#0a0a0a' }}>
                {file.file_type === 'image' ? (
                  <img src={file.url || ''} alt={file.filename} className="w-full h-full object-cover" />
                ) : file.file_type === 'video' ? (
                  <video src={file.url || ''} className="w-full h-full object-cover" controls muted />
                ) : file.file_type === 'pdf' ? (
                  <iframe src={file.url || ''} className="w-full h-full border-0 pointer-events-none" title={file.filename || 'PDF'} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <Film className="w-6 h-6 text-white/30" />
                    <span className="text-[10px] text-white/20">{file.filename}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="text-[10px] text-white/60 bg-black/60 px-2 py-0.5 rounded">#{idx + 1}</span>
                  <button onClick={() => deleteFile(file.id)} className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500">
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
        <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2 block">Internal Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={save}
          rows={3}
          placeholder="Notes, references, ideas..."
          className="w-full bg-transparent text-sm text-white/60 placeholder-white/20 outline-none resize-none"
        />
      </div>

      {/* Remix Sources */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
        <RemixSources contentType="instagram_post" contentId={id} />
      </div>

      {/* Metricool Scheduling */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
        <MetricoolScheduler
          socialPostId={id}
          platform="instagram"
          text={caption}
          hashtags={[]}
          initialScheduledAt={scheduledAt || null}
          initialMetricoolId={post.metricool_post_id ?? null}
          accentColor="#e1306c"
        />
      </div>

      {/* Meta */}
      <p className="text-[11px] text-white/20 text-center">
        Created {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  )
}
