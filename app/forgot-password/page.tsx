'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-sm font-bold text-white mx-auto mb-4">
            CD
          </div>
          <h1 className="text-xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">We'll send you a reset link</p>
        </div>

        <div className="card bg-gray-900 border border-white/5 rounded-xl">
          <div className="card-body p-6 space-y-4">
            {sent ? (
              <div className="text-center space-y-3">
                <p className="text-green-400 text-sm">Check your email for a password reset link.</p>
                <Link href="/login" className="text-red-400 hover:text-red-300 text-sm">
                  Back to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
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
                  {loading ? <span className="loading loading-spinner loading-xs" /> : 'Send Reset Link'}
                </button>

                <div className="text-center">
                  <Link href="/login" className="text-gray-500 hover:text-gray-400 text-sm">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
