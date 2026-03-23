/**
 * Tests for /api/thumbnails/generate and /api/thumbnails/analyze routes
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Supabase mock ────────────────────────────────────────────────────────────
const mockStorageUpload = vi.fn().mockResolvedValue({ error: null })
const mockStorageGetPublicUrl = vi.fn().mockReturnValue({
  data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/thumbnails/test.png' },
})

let mockDbResult: { data?: any; error?: any } = { data: null, error: null }

const mockFromChain = () => {
  const chain: any = {
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  }
  Object.keys(chain).forEach(k => {
    if (k !== 'single') chain[k].mockReturnValue(chain)
  })
  chain.single.mockResolvedValue(mockDbResult)
  chain.then = (res: any, rej: any) => Promise.resolve(mockDbResult).then(res, rej)
  return chain
}

const mockStorage = {
  from: vi.fn(() => ({
    upload: mockStorageUpload,
    getPublicUrl: mockStorageGetPublicUrl,
  })),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => mockFromChain()),
    storage: mockStorage,
  }),
}))

// ─── Fetch mock ───────────────────────────────────────────────────────────────
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const makeRequest = (body: any) =>
  new NextRequest('http://localhost/api/thumbnails/generate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('POST /api/thumbnails/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-key'
    // Reset storage mocks
    mockStorageUpload.mockResolvedValue({ error: null })
    mockStorageGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/thumb.png' },
    })
  })

  it('returns 400 when prompt is empty', async () => {
    const { POST } = await import('../../app/api/thumbnails/generate/route')
    const req = makeRequest({ prompt: '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Prompt is required')
  })

  it('returns 400 when prompt exceeds 1,000 characters', async () => {
    const { POST } = await import('../../app/api/thumbnails/generate/route')
    const req = makeRequest({ prompt: 'x'.repeat(1001) })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('too long')
  })

  it('returns 503 when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY
    const { POST } = await import('../../app/api/thumbnails/generate/route')
    const req = makeRequest({ prompt: 'A great thumbnail' })
    const res = await POST(req)
    expect(res.status).toBe(503)
  })

  it('generates thumbnail successfully and returns 201', async () => {
    const dalleImageUrl = 'https://oaidalleapiprodscus.blob.core.windows.net/private/fake-image.png'
    const fakeImageBuffer = new ArrayBuffer(100)

    // DALL-E response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ url: dalleImageUrl, revised_prompt: 'YouTube thumbnail: A great thumbnail.' }],
      }),
    })
    // Image download response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => fakeImageBuffer,
    })

    mockDbResult = {
      data: {
        id: 'thumb-1',
        storage_path: 'generated-123.png',
        url: null,
        tags: ['ai-generated', 'dalle-3'],
      },
      error: null,
    }

    const { POST } = await import('../../app/api/thumbnails/generate/route')
    const req = makeRequest({ prompt: 'A great thumbnail', tags: ['ai-generated'] })
    const res = await POST(req)

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.thumbnail).toBeDefined()
    expect(json.revisedPrompt).toBeDefined()
    expect(mockStorageUpload).toHaveBeenCalledOnce()
  })

  it('returns 500 when DALL-E API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'DALL-E quota exceeded',
    })

    const { POST } = await import('../../app/api/thumbnails/generate/route')
    const req = makeRequest({ prompt: 'A thumbnail' })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toContain('DALL-E error')
  })

  it('returns 500 when no image URL returned', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    })

    const { POST } = await import('../../app/api/thumbnails/generate/route')
    const req = makeRequest({ prompt: 'A thumbnail' })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toContain('No image returned')
  })

  it('returns 500 when storage upload fails', async () => {
    const dalleImageUrl = 'https://oaidalleapiprodscus.blob.core.windows.net/fake.png'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ url: dalleImageUrl, revised_prompt: 'test' }] }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(10),
    })

    mockStorageUpload.mockResolvedValueOnce({ error: { message: 'Storage quota exceeded' } })

    const { POST } = await import('../../app/api/thumbnails/generate/route')
    const req = makeRequest({ prompt: 'A thumbnail' })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Storage quota exceeded')
  })
})
