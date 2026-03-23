/**
 * Tests for /api/social routes
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Supabase mock ────────────────────────────────────────────────────────────
let mockResult: { data?: any; error?: any } = { data: [], error: null }

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => {
      const chain: any = {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        limit: vi.fn(),
        single: vi.fn(),
      }
      Object.keys(chain).forEach(k => {
        if (k !== 'single') chain[k].mockReturnValue(chain)
      })
      chain.single.mockResolvedValue(mockResult)
      chain.then = (resolve: any, reject: any) =>
        Promise.resolve(mockResult).then(resolve, reject)
      return chain
    }),
  }),
}))

const makeGETRequest = (search = '') =>
  new NextRequest(`http://localhost/api/social${search ? '?' + search : ''}`)

const makePOSTRequest = (body: any) =>
  new NextRequest('http://localhost/api/social', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

// ─── GET /api/social ──────────────────────────────────────────────────────────
describe('GET /api/social', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 and list of posts', async () => {
    mockResult = {
      data: [
        {
          id: 'post-1',
          title: 'Test Reel',
          platform: 'instagram',
          type: 'reel',
          status: 'draft',
          media_files: [],
        },
      ],
      error: null,
    }

    const { GET } = await import('../../app/api/social/route')
    const res = await GET(makeGETRequest())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json)).toBe(true)
    expect(json[0].title).toBe('Test Reel')
  })

  it('returns empty array when no posts', async () => {
    mockResult = { data: null, error: null }
    const { GET } = await import('../../app/api/social/route')
    const res = await GET(makeGETRequest())
    const json = await res.json()
    expect(json).toEqual([])
  })

  it('returns 500 on database error', async () => {
    mockResult = { data: null, error: { message: 'DB error' } }
    const { GET } = await import('../../app/api/social/route')
    const res = await GET(makeGETRequest())
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('DB error')
  })

  it('filters by platform when query param is provided', async () => {
    mockResult = { data: [], error: null }
    const { GET } = await import('../../app/api/social/route')
    const res = await GET(makeGETRequest('platform=instagram'))
    expect(res.status).toBe(200)
  })

  it('filters by type when query param is provided', async () => {
    mockResult = { data: [], error: null }
    const { GET } = await import('../../app/api/social/route')
    const res = await GET(makeGETRequest('type=reel'))
    expect(res.status).toBe(200)
  })
})

// ─── POST /api/social ─────────────────────────────────────────────────────────
describe('POST /api/social', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a social post and returns 201', async () => {
    const newPost = {
      id: 'post-new',
      title: 'New Reel',
      platform: 'instagram',
      type: 'reel',
      caption: 'Check this out!',
      hashtags: ['#ai', '#automation'],
      status: 'draft',
    }
    mockResult = { data: newPost, error: null }

    const { POST } = await import('../../app/api/social/route')
    const req = makePOSTRequest({
      title: 'New Reel',
      platform: 'instagram',
      type: 'reel',
      caption: 'Check this out!',
      hashtags: ['#ai', '#automation'],
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.title).toBe('New Reel')
    expect(json.platform).toBe('instagram')
  })

  it('defaults status to draft when not provided', async () => {
    mockResult = { data: { id: 'p1', status: 'draft' }, error: null }
    const { POST } = await import('../../app/api/social/route')
    const req = makePOSTRequest({
      title: 'Post',
      platform: 'linkedin',
      type: 'post',
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it('returns 500 when insert fails', async () => {
    mockResult = { data: null, error: { message: 'Insert failed' } }
    const { POST } = await import('../../app/api/social/route')
    const req = makePOSTRequest({ title: 'Fail', platform: 'instagram', type: 'reel' })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
