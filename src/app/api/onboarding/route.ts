import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data } = await adminSupabase
    .from('user_settings')
    .select('value')
    .eq('key', 'onboarding_completed')
    .single()

  return NextResponse.json({ completed: data?.value === 'true' })
}

export async function POST(req: NextRequest) {
  // Get current user to tie the onboarding cookie to this account
  const sessionClient = await createSessionClient()
  const { data: { user } } = await sessionClient.auth.getUser()

  const body = await req.json()
  const { channel_name, niche, platforms, content_types } = body

  // Save onboarding data to user_settings
  const settings = [
    { key: 'onboarding_completed', value: 'true' },
    { key: 'channel_name', value: channel_name || '' },
    { key: 'niche', value: niche || '' },
    { key: 'platforms', value: JSON.stringify(platforms || []) },
  ]

  for (const setting of settings) {
    if (setting.value) {
      await adminSupabase
        .from('user_settings')
        .upsert(setting, { onConflict: 'key' })
    }
  }

  // Save content preferences if provided
  if (content_types && Array.isArray(content_types)) {
    for (const ct of content_types) {
      await adminSupabase
        .from('content_preferences')
        .insert({
          platform: ct.platform,
          content_type: ct.content_type,
          preference: ct.preference,
          source: 'onboarding',
        })
    }
  }

  // Create initial topics from niche if provided
  if (niche) {
    await supabase
      .from('topics')
      .insert({
        name: niche,
        description: `Primary content niche set during onboarding`,
        status: 'active',
        target_posts: 10,
      })
  }

  const response = NextResponse.json({ ok: true })

  // Set cookie so middleware can skip the DB check on every request.
  // Value = user ID so the cookie is invalidated when a different account signs in.
  if (user) {
    response.cookies.set('onboarding_done', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }

  return response
}
