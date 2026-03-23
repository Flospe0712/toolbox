'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Check if onboarding is completed — redirect accordingly
      try {
        const res = await fetch('/api/onboarding')
        const data = await res.json()
        router.push(data.completed ? '/dashboard' : '/onboarding')
      } catch {
        router.push('/dashboard')
      }
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Shipyard</h1>
          <p className="text-gray-500 text-sm mt-1">Content OS</p>
        </div>

        <div className="card bg-gray-900 border border-white/5 rounded-xl">
          <div className="card-body p-6 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="form-control gap-1.5">
                <label className="label py-0">
                  <span className="label-text text-gray-500 text-xs uppercase tracking-widest font-medium">Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-sm bg-gray-800 border-white/10 text-white placeholder-gray-600 focus:border-red-500/50 focus:outline-none w-full rounded-lg h-10"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-control gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="label py-0">
                    <span className="label-text text-gray-500 text-xs uppercase tracking-widest font-medium">Password</span>
                  </label>
                  <a href="/forgot-password" className="text-red-400 hover:text-red-300 text-xs">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-sm bg-gray-800 border-white/10 text-white placeholder-gray-600 focus:border-red-500/50 focus:outline-none w-full rounded-lg h-10"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="alert alert-error alert-soft p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-sm w-full bg-red-600 hover:bg-red-700 border-0 text-white h-10"
              >
                {loading ? <span className="loading loading-spinner loading-xs" /> : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
