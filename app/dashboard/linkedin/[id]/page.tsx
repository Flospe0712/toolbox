'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Trash2, Upload, X, Linkedin, Gift, Link2, ThumbsUp, MessageCircle, Repeat2, Send, ChevronLeft, ChevronRight, RefreshCw, Sparkles, Loader2 } from 'lucide-react'
import type { SocialPost, SocialPostStatus } from '@/lib/types'
import { ContentScorer } from '@/components/content-scorer'
import { MetricoolScheduler } from '@/components/metricool-scheduler'
import { RemixSources } from '@/components/remix-sources'
import { PdfCarousel } from '@/components/pdf-carousel'
import ProfileAvatar from '@/components/profile-avatar'

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  post: { label: 'Post', color: '#0077b5' },
  article: { label: 'Article', color: '#00a0dc' },
  carousel: { label: 'Carousel', color: '#0e76a8' },
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

export default function LinkedInPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<SocialPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generatingCaption, setGeneratingCaption] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const [replacingFileId, setReplacingFileId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<SocialPostStatus>('draft')
  const [scheduledAt, setScheduledAt] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [hasLeadMagnet, setHasLeadMagnet] = useState(false)
  const [leadMagnetUrl, setLeadMagnetUrl] = useState('')
  const [slideIdx, setSlideIdx] = useState(0)

  useEffect(() => {
    fetch(`/api/social/${id}`)
      .then(r => r.json())
      .then(data => {
        setPost(data)
        setTitle(data.title || '')
        setBody(data.body || '')
        setNotes(data.notes || '')
        setStatus(data.status || 'draft')
        setScheduledAt(data.scheduled_at ? data.scheduled_at.slice(0, 16) : '')
        setTargetDate(data.target_date || '')
        setHasLeadMagnet(data.has_lead_magnet || false)
        setLeadMagnetUrl(data.lead_magnet_url || '')
        setLoading(false)
      })
  }, [id])

  const save = async () => {
    setSaving(true)
    await fetch(`/api/social/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, caption: null, body: body || null, notes: notes || null, status, scheduled_at: scheduledAt || null, target_date: targetDate || null, has_lead_magnet: hasLeadMagnet, lead_magnet_url: leadMagnetUrl || null }),
    })
    setSaving(false)
  }

  const deletePost = async () => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/social/${id}`, { method: 'DELETE' })
    router.push('/dashboard/linkedin')
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('order_index', String(post?.media_files?.length || 0))
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
        setBody(data.caption)
        setTimeout(save, 200)
      }
    } catch (err) {
      console.error('Failed to generate caption:', err)
    }
    setGeneratingCaption(false)
  }

  const replaceFile = async (oldFileId: string, newFile: File) => {
    setUploading(true)
    const oldFile = post?.media_files?.find(f => f.id === oldFileId)
    const fd = new FormData()
    fd.append('file', newFile)
    fd.append('order_index', String(oldFile?.order_index ?? 0))
    const res = await fetch(`/api/social/${id}/media`, { method: 'POST', body: fd })
    if (res.ok) {
      const uploaded = await res.json()
      await fetch(`/api/social/${id}/media?file_id=${oldFileId}`, { method: 'DELETE' })
      setPost(p => p ? { ...p, media_files: (p.media_files || []).filter(f => f.id !== oldFileId).concat(uploaded) } : p)
    }
    setUploading(false)
    setReplacingFileId(null)
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

  const cfg = TYPE_CONFIG[post.type] || { label: post.type, color: '#0077b5' }
  const hasContent = !!(post?.media_files?.length || body.trim() || notes.trim())

  const allMedia = (post.media_files || []).sort((a, b) => a.order_index - b.order_index)
  const images = allMedia.filter(f => f.file_type === 'image')
  const videos = allMedia.filter(f => f.file_type === 'video')
  const pdfs = allMedia.filter(f => f.file_type === 'pdf')
  const slides = allMedia.filter(f => f.file_type === 'image' || f.file_type === 'pdf' || f.file_type === 'video')
  const isCarousel = post.type === 'carousel'

  return (
    <div className="min-h-screen p-4 sm:p-8 mx-auto" style={{ background: '#0d0d0d', maxWidth: 720 }}>
      <button onClick={() => router.push('/dashboard/linkedin')} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        LinkedIn
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#0077b5' }}>
            <Linkedin className="w-4 h-4 text-white" />
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} onBlur={save}
            className="flex-1 bg-transparent text-xl font-semibold text-white/90 outline-none border-b border-transparent hover:border-white/10 focus:border-white/20 pb-0.5 transition-colors"
            placeholder="Post title..." />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: `${cfg.color}18`, color: cfg.color }}>{cfg.label}</span>
          <button onClick={deletePost} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 mb-6">
        <select value={status} onChange={e => { setStatus(e.target.value as SocialPostStatus); setTimeout(save, 100) }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-white/20">
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {status === 'scheduled' && (
          <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} onBlur={save}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 outline-none focus:border-white/20" />
        )}
        {status !== 'scheduled' && status !== 'published' && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">Target</span>
            <input type="date" value={targetDate} onChange={e => { setTargetDate(e.target.value); setTimeout(save, 100) }}
              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/50 outline-none focus:border-white/20" />
          </div>
        )}
        <button onClick={save} disabled={saving} className="ml-auto px-4 py-2 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-40" style={{ background: '#0077b5' }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* LinkedIn-style Editable Post */}
      <div className="mb-4">
        <div className="w-full rounded-xl overflow-hidden" style={{ background: '#1b1f23', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="p-4 sm:p-5 pb-3">
            <div className="flex items-start gap-3">
              <ProfileAvatar size={48} fallback="U" fallbackTextClass="text-lg" fallbackTextColor="text-white" style={{ background: '#0077b5' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Your Name</p>
                <p className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>Your headline</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Just now</p>
              </div>
              <Linkedin className="w-4 h-4 flex-shrink-0" style={{ color: '#0077b5' }} />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 sm:px-5 pb-2">
            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
              {post.type === 'article' ? 'Article' : 'Post'}
            </label>
            <button onClick={generateCaption} disabled={generatingCaption || !hasContent}
              className="flex items-center gap-1 text-[10px] font-medium text-white/30 hover:text-white/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              {generatingCaption ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Auto-generate
            </button>
          </div>
          <div className="px-4 sm:px-5 pb-3">
            <textarea value={body} onChange={e => setBody(e.target.value)} onBlur={save}
              rows={post.type === 'article' ? 18 : 14}
              placeholder={post.type === 'article' ? 'Write the full article here...' : 'Write your post...'}
              className="w-full bg-transparent text-[15px] text-white/90 placeholder-white/25 outline-none resize-none leading-relaxed"
              style={{ minHeight: 200 }} />
          </div>

          {hasLeadMagnet && (
            <div className="mx-4 sm:mx-5 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,119,181,0.1)', border: '1px solid rgba(0,119,181,0.2)' }}>
              <Gift className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0077b5' }} />
              <span className="text-[11px] font-medium" style={{ color: '#0ea5e9' }}>{leadMagnetUrl || 'Lead magnet attached'}</span>
            </div>
          )}

          {/* Media: PDF carousel */}
          {isCarousel && pdfs.length > 0 && <PdfCarousel url={pdfs[0].url || ''} filename={pdfs[0].filename} />}

          {/* Media: Image carousel */}
          {isCarousel && pdfs.length === 0 && slides.length > 0 && (() => {
            const safe = Math.min(slideIdx, slides.length - 1)
            const slide = slides[safe]
            return (
              <div className="relative" style={{ background: '#0a0a0a' }}>
                <div className="w-full" style={{ aspectRatio: '4/5' }}>
                  {slide.file_type === 'image' && slide.url ? (
                    <img src={slide.url} alt="" className="w-full h-full object-contain" />
                  ) : slide.file_type === 'video' && slide.url ? (
                    <video src={slide.url} controls className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <span className="text-xs text-white/25 px-4 text-center truncate max-w-[80%]">{slide.filename}</span>
                    </div>
                  )}
                </div>
                {slides.length > 1 && (
                  <>
                    {safe > 0 && (
                      <button onClick={() => setSlideIdx(i => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-100" style={{ background: 'rgba(0,0,0,0.7)', opacity: 0.8 }}>
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                    )}
                    {safe < slides.length - 1 && (
                      <button onClick={() => setSlideIdx(i => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-100" style={{ background: 'rgba(0,0,0,0.7)', opacity: 0.8 }}>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </>
                )}
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full transition-all" style={{ width: `${((safe + 1) / slides.length) * 100}%`, background: '#0a66c2' }} />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <span className="text-[11px] font-medium text-white/60">{safe + 1} of {slides.length}</span>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Single image */}
          {!isCarousel && images.length === 1 && (
            <div style={{ background: '#0a0a0a' }}>
              <img src={images[0].url || ''} alt="" className="w-full h-auto" style={{ maxHeight: 480, objectFit: 'contain' }} />
            </div>
          )}
          {/* Multiple images grid */}
          {!isCarousel && images.length >= 2 && (
            <div className="grid grid-cols-2" style={{ gap: 2, background: '#0a0a0a' }}>
              {images.slice(0, 4).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden">
                  <img src={img.url || ''} alt="" className="w-full h-full object-cover" />
                  {i === 3 && images.length > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
                      <span className="text-white text-2xl font-semibold">+{images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Videos */}
          {!isCarousel && videos.length > 0 && (
            <div style={{ background: '#0a0a0a' }}>
              {videos.map(vid => (
                <video key={vid.id} src={vid.url || ''} controls className="w-full" style={{ maxHeight: 480 }} />
              ))}
            </div>
          )}

          {/* PDFs */}
          {!isCarousel && pdfs.length > 0 && pdfs.map(pdf => (
            <PdfCarousel key={pdf.id} url={pdf.url || ''} filename={pdf.filename} />
          ))}

          {/* Engagement bar */}
          <div className="px-4 sm:px-5 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              {[
                { icon: ThumbsUp, label: 'Like' },
                { icon: MessageCircle, label: 'Comment' },
                { icon: Repeat2, label: 'Repost' },
                { icon: Send, label: 'Send' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5">
                  <Icon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Scorer */}
      {body.trim() && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
          <ContentScorer content={body} type={post.type === 'article' ? 'description' : 'linkedin_post'} label={post.type === 'article' ? 'Score this article' : 'Score this post'} />
        </div>
      )}

      {/* Lead Magnet */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Gift className="w-3 h-3" />
            Lead Magnet
          </label>
          <button onClick={() => { setHasLeadMagnet(!hasLeadMagnet); setTimeout(save, 100) }}
            className="relative w-10 h-5 rounded-full transition-colors"
            style={{ background: hasLeadMagnet ? '#0077b5' : 'rgba(255,255,255,0.1)' }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: hasLeadMagnet ? 22 : 2 }} />
          </button>
        </div>
        {hasLeadMagnet && (
          <div className="flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
            <input value={leadMagnetUrl} onChange={e => setLeadMagnetUrl(e.target.value)} onBlur={save}
              placeholder="Lead magnet URL or description..."
              className="flex-1 bg-transparent text-sm text-white/70 placeholder-white/20 outline-none" />
          </div>
        )}
      </div>

      {/* Media */}
      {(post.type === 'carousel' || post.type === 'post') && (
        <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
              Media {post.media_files?.length ? `(${post.media_files.length})` : ''}
            </label>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white/80 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <input ref={fileInputRef} type="file" accept={isCarousel ? 'image/*' : 'image/*,video/*,application/pdf'} multiple className="hidden"
              onChange={async e => { for (const f of Array.from(e.target.files || [])) await uploadFile(f); e.target.value = '' }} />
            <input ref={replaceInputRef} type="file" accept={isCarousel ? 'image/*' : 'image/*,video/*,application/pdf'} className="hidden"
              onChange={async e => { const f = e.target.files?.[0]; if (f && replacingFileId) await replaceFile(replacingFileId, f); e.target.value = '' }} />
          </div>
          {!post.media_files?.length ? (
            <div className="border border-dashed rounded-lg py-8 flex flex-col items-center gap-2 cursor-pointer hover:border-white/15 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }} onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-5 h-5 text-white/20" />
              <p className="text-xs text-white/25">{isCarousel ? 'Upload carousel slide images' : 'Upload images or PDF slides'}</p>
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
                      <span className="text-[10px] text-white/30">#{idx + 1}</span>
                      <span className="text-[10px] text-white/20 px-1 text-center truncate">{file.filename}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => { setReplacingFileId(file.id); replaceInputRef.current?.click() }}
                      className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30" title="Replace">
                      <RefreshCw className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button onClick={() => deleteFile(file.id)}
                      className="w-7 h-7 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500" title="Delete">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
        <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2 block">Internal Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={save} rows={3}
          placeholder="Notes, references, ideas..."
          className="w-full bg-transparent text-sm text-white/60 placeholder-white/20 outline-none resize-none" />
      </div>

      {/* Remix Sources */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
        <RemixSources contentType="linkedin_post" contentId={id} />
      </div>

      {/* Metricool Scheduling */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)' }}>
        <MetricoolScheduler
          socialPostId={id}
          platform="linkedin"
          text={body}
          hashtags={[]}
          initialScheduledAt={scheduledAt || null}
          initialMetricoolId={(post as any).metricool_post_id ?? null}
          accentColor="#0077b5"
        />
      </div>

      <p className="text-[11px] text-white/20 text-center">
        Created {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  )
}
