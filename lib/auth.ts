import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

type AuthResult =
  | { user: User; error: null }
  | { user: null; error: NextResponse }

/**
 * Call inside any API route that should require a logged-in session.
 * Middleware already blocks unauthenticated page requests; this guards
 * API routes that receive the x-api-key bypass or are called directly.
 *
 * Usage:
 *   const { user, error } = await requireAuth()
 *   if (error) return error
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { user, error: null }
}

/** Strip system-managed fields that must never be set by a client PATCH body. */
export function sanitizePatchBody(body: Record<string, unknown>): Record<string, unknown> {
  const IMMUTABLE = new Set(['id', 'created_at', 'user_id'])
  return Object.fromEntries(
    Object.entries(body).filter(([k]) => !IMMUTABLE.has(k))
  )
}
