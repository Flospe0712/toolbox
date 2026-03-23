/**
 * Tests for /api/videos/[id] route
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Supabase mock ────────────────────────────────────────────────────────────
let mockResult: { data?: any; error?: any } = { data: null, error: null }

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

const makeRequest = (method: string, id: string, body?: any) =>
  new NextRequest(`http://localhost/api/videos/${id}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  })

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) })

// ─── GET /api/videos/[id] ─────────────────────────────────────────────────────
describe('GET /api/videos/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns video with assets', async () => {
    mockResult = {
      data: {
        id: 'vid-1',
        title: 'My Video',
        platform: 'youtube',
        status: 'draft',
        assets: [{ id: 'asset-1', type: 'script', status: 'draft' }],
      },
      error: null,
    }

    const { GET } = await import('../../app/api/videos/[id]/route')
    const res = await GET(makeRequest('GET', 'vid-1'), makeParams('vid-1'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.title).toBe('My Video')
    expect(json.assets).toHaveLength(1)
  })

  it('returns 404 when video not found', async () => {
    mockResult = { data: null, error: { message: 'Not found' } }
    const { GET } = await import('../../app/api/videos/[id]/route')
    const res = await GET(makeRequest('GET', 'nonexistent'), makeParams('nonexistent'))
    expect(res.status).toBe(404)
  })
})

// ─── PATCH /api/videos/[id] ───────────────────────────────────────────────────
describe('PATCH /api/videos/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates video and returns updated data', async () => {
    mockResult = {
      data: { id: 'vid-1', title: 'Updated Title', status: 'published' },
      error: null,
    }

    const { PATCH } = await import('../../app/api/videos/[id]/route')
    const req = makeRequest('PATCH', 'vid-1', { title: 'Updated Title', status: 'published' })
    const res = await PATCH(req, makeParams('vid-1'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.title).toBe('Updated Title')
    expect(json.status).toBe('published')
  })

  it('returns 500 on update error', async () => {
    mockResult = { data: null, error: { message: 'Update failed' } }
    const { PATCH } = await import('../../app/api/videos/[id]/route')
    const req = makeRequest('PATCH', 'vid-1', { status: 'published' })
    const res = await PATCH(req, makeParams('vid-1'))
    expect(res.status).toBe(500)
  })
})

// ─── DELETE /api/videos/[id] ─────────────────────────────────────────────────
describe('DELETE /api/videos/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes video and returns success', async () => {
    mockResult = { data: null, error: null }
    const { DELETE } = await import('../../app/api/videos/[id]/route')
    const req = makeRequest('DELETE', 'vid-1')
    const res = await DELETE(req, makeParams('vid-1'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns 500 when delete fails', async () => {
    // Need the final delete (on videos table) to fail
    // Since all chain calls use the same mockResult, simulate error
    mockResult = { data: null, error: { message: 'Delete constraint violation' } }
    const { DELETE } = await import('../../app/api/videos/[id]/route')
    const req = makeRequest('DELETE', 'vid-1')
    const res = await DELETE(req, makeParams('vid-1'))
    expect(res.status).toBe(500)
  })
})
