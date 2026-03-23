'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-sm font-bold text-white mx-auto mb-4">
            CD
          </div>
          <h1 className="text-xl font-bold tracking-tight">Set New Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your new password below</p>
        </div>

        <div className="card bg-gray-900 border border-white/5 rounded-xl">
          <div className="card-body p-6 space-y-4">
            <form onSubmit={handleReset} className="space-y-4">
              <div className="form-control gap-1.5">
                <label className="label py-0">
                  <span className="label-text text-gray-500 text-xs uppercase tracking-widest font-medium">New Password</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-sm bg-gray-800 border-white/10 text-white placeholder-gray-600 focus:border-red-500/50 focus:outline-none w-full rounded-lg h-10"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-control gap-1.5">
                <label className="label py-0">
                  <span className="label-text text-gray-500 text-xs uppercase tracking-widest font-medium">Confirm Password</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? <span className="loading loading-spinner loading-xs" /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
