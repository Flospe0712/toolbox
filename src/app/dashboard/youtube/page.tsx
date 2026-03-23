import { createClient } from '@/lib/supabase/server'
import { VideoGrid } from '@/components/video-grid'
import { YouTubeHeaderActions } from '@/components/youtube-header-actions'

export default async function YouTubePage() {
  const supabase = await createClient()

  const { data: videos, error } = await supabase
    .from('videos')
    .select('*, assets(*), video_thumbnails(thumbnail:thumbnails(*), is_chosen)')
    .eq('platform', 'youtube')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-8" style={{ background: '#0d0d0d', minHeight: '100vh' }}>
        <p className="text-sm" style={{ color: '#f87171' }}>Error loading videos: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8" style={{ background: '#0d0d0d', minHeight: '100vh' }}>
      <YouTubeHeaderActions videos={(videos ?? []) as Parameters<typeof YouTubeHeaderActions>[0]['videos']} />
      <VideoGrid videos={(videos ?? []) as Parameters<typeof VideoGrid>[0]['videos']} />
    </div>
  )
}
