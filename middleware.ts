import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Allow server-to-server API access via x-api-key header.
  // Set INTERNAL_API_KEY in your environment and pass it from trusted callers
  // (e.g. Vercel Cron jobs, internal scripts). Never expose this key client-side.
  const isApi = request.nextUrl.pathname.startsWith('/api/')
  if (isApi) {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
      return NextResponse.next({ request })
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (isApi) {
      // Return 401 JSON for unauthenticated API requests
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const publicPaths = ['/login', '/forgot-password', '/reset-password', '/auth/callback']
    if (!publicPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/forgot-password')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users to onboarding if not completed (skip for API routes and onboarding itself)
  // Cookie value equals user.id so it is invalidated on account switch.
  if (user && !isApi && !request.nextUrl.pathname.startsWith('/onboarding') && !request.nextUrl.pathname.startsWith('/auth/')) {
    const onboardingDone = request.cookies.get('onboarding_done')?.value === user.id
    if (!onboardingDone) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  // Now covers both dashboard routes AND /api/ routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
