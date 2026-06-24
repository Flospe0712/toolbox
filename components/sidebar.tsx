'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Calendar, Image, Newspaper, Hash, Users,
  BarChart2, Zap, Shuffle, Settings, ChevronUp, LogOut, Youtube, Instagram, Linkedin
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProfileAvatar from '@/components/profile-avatar'
import { Sparkline } from '@/components/sparkline'

// ─── Nav sections ─────────────────────────────────────────────────────────────

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  color?: string
}

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: '',
    items: [
      { href: '/dashboard', label: 'Home', icon: Home, exact: true },
    ],
  },
  {
    label: 'Research',
    items: [
      { href: '/dashboard/news',       label: 'News',       icon: Newspaper,  color: '#6366f1' },
      { href: '/dashboard/topics',     label: 'Topics',     icon: Hash,       color: '#f59e0b' },
      { href: '/dashboard/formats',    label: 'Formats',    icon: Shuffle },
    ],
  },
  {
    label: 'Create',
    items: [
      { href: '/dashboard/youtube',   label: 'YouTube',   icon: Youtube,   color: '#dc2626' },
      { href: '/dashboard/instagram', label: 'Instagram', icon: Instagram, color: '#e1306c' },
      { href: '/dashboard/linkedin',  label: 'LinkedIn',  icon: Linkedin,  color: '#0077b5' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/dashboard/analytics',       label: 'Analytics',       icon: BarChart2,  color: '#10b981' },
      { href: '/dashboard/calendar',        label: 'Calendar',        icon: Calendar,   color: '#3b82f6' },
      { href: '/dashboard/competitors',    label: 'Competitors',     icon: Users,      color: '#f97316' },
    ],
  },
]

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  accentColor,
}: {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  accentColor?: string
}) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)
  const color = accentColor ?? '#dc2626'

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
      style={{
        background: isActive ? `${color}15` : 'transparent',
        color: isActive ? color : 'rgba(255,255,255,0.4)',
        border: isActive ? `1px solid ${color}25` : '1px solid transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
        }
      }}
    >
      <Icon className="w-4 h-4 flex-shrink-0 opacity-80" />
      {label}
    </Link>
  )
}

// ─── Profile Stats ───────────────────────────────────────────────────────────

function ProfileStats({ userEmail }: { userEmail?: string | null }) {
  const [total, setTotal] = useState<number | null>(null)
  const [sparkData, setSparkData] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  const initials = userEmail
    ? userEmail.split('@')[0].slice(0, 2).toUpperCase()
    : '?'

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return n.toLocaleString()
  }

  useEffect(() => {
    function parseTimeline(data: unknown): number[] {
      const arr = Array.isArray(data) ? data : []
      const sorted = [...arr].sort((a: [unknown, unknown], b: [unknown, unknown]) => {
        const ta = Number(a[0]) > 1e12 ? Number(a[0]) : new Date(String(a[0])).getTime()
        const tb = Number(b[0]) > 1e12 ? Number(b[0]) : new Date(String(b[0])).getTime()
        return ta - tb
      })
      return sorted.map((p: [unknown, unknown]) => parseFloat(String(p[1])) || 0)
    }

    async function fetchAll() {
      const allSpark: number[][] = []
      let sum = 0

      // YouTube — daily views
      try {
        const res = await fetch('/api/metricool?endpoint=timeline&metric=ytviews')
        if (res.ok) {
          const values = parseTimeline(await res.json())
          const total = values.reduce((a, b) => a + b, 0)
          if (total > 0) { sum += total; allSpark.push(values.slice(-30)) }
        }
      } catch { /* skip */ }

      // Instagram — daily reach
      try {
        const res = await fetch('/api/metricool?endpoint=timeline&metric=igreach')
        if (res.ok) {
          const values = parseTimeline(await res.json())
          const total = values.reduce((a, b) => a + b, 0)
          if (total > 0) { sum += total; allSpark.push(values.slice(-30)) }
        }
      } catch { /* skip */ }

      // LinkedIn — post-level impressions
      try {
        const now = new Date().toISOString().split('.')[0]
        const yearAgo = new Date()
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        const from = yearAgo.toISOString().split('.')[0]
        const res = await fetch(`/api/metricool?endpoint=linkedin_posts&from=${from}&to=${now}`)
        if (res.ok) {
          const d = await res.json()
          const posts = d?.data ?? (Array.isArray(d) ? d : [])
          const total = posts.reduce((s: number, p: any) => s + (p.impressions ?? 0), 0)
          if (total > 0) sum += total
        }
      } catch { /* skip */ }

      if (sum > 0) {
        setTotal(sum)
        // Merge sparklines by summing per-day values
        if (allSpark.length >= 1) {
          const maxLen = Math.max(...allSpark.map(s => s.length))
          const merged = Array.from({ length: maxLen }, (_, i) =>
            allSpark.reduce((s, arr) => s + (arr[arr.length - maxLen + i] ?? 0), 0)
          )
          setSparkData(merged)
        }
      }
      setLoading(false)
    }

    fetchAll()
  }, [])

  return (
    <div className="px-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2.5">
        <ProfileAvatar
          size={36}
          fallback={initials}
          style={{ background: 'rgba(255,255,255,0.08)' }}
          fallbackTextClass="text-[11px]"
          fallbackTextColor="text-white/40"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-white/50 truncate">
            {userEmail ? userEmail.split('@')[0].split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Account'}
          </p>
          {loading ? (
            <div className="h-4 w-14 rounded bg-white/5 animate-pulse mt-0.5" />
          ) : total != null ? (
            <p className="text-[15px] font-bold text-white font-mono leading-tight">
              {fmt(total)}
              <span className="text-[9px] font-medium text-white/25 ml-1 font-sans">impressions</span>
            </p>
          ) : (
            <p className="text-[10px] text-white/20 mt-0.5">No platforms connected</p>
          )}
        </div>
      </div>
      {sparkData.length >= 2 && (
        <div className="mt-2 -mx-1">
          <Sparkline
            data={sparkData}
            height={28}
            color="#dc2626"
            strokeWidth={1.5}
            showDot
            fill
          />
        </div>
      )}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  userEmail?: string | null
}

function UserMenu({ userEmail }: { userEmail?: string | null }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userEmail
    ? userEmail.split('@')[0].slice(0, 2).toUpperCase()
    : '?'

  return (
    <div ref={menuRef} className="relative px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Popover menu */}
      {open && (
        <div
          className="absolute bottom-full left-2 right-2 mb-1 rounded-lg py-1 shadow-xl"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {userEmail && (
            <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[11px] font-medium text-white/70 truncate">{userEmail}</p>
            </div>
          )}
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors w-full text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
      >
        <ProfileAvatar
          size={28}
          fallback={initials}
          style={{ background: 'rgba(255,255,255,0.08)' }}
          fallbackTextClass="text-[10px]"
          fallbackTextColor="text-white/40"
        />
        <span className="flex-1 text-left text-[12px] font-medium text-white/50 truncate">
          {userEmail ? userEmail.split('@')[0] : 'Account'}
        </span>
        <ChevronUp
          className="w-3.5 h-3.5 text-white/30 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
    </div>
  )
}

export function Sidebar({ userEmail }: SidebarProps) {
  return (
      <aside
        data-tour="sidebar"
        className="fixed top-3 left-3 w-64 flex flex-col z-10 rounded-2xl overflow-hidden"
        style={{
          background: '#0f0f0f',
          border: '1px solid rgba(255,255,255,0.08)',
          height: 'calc(100vh - 24px)',
        }}
      >
        {/* Brand */}
        <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-[13px] tracking-tight leading-none">Shipyard</p>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Content OS</p>
            </div>
          </Link>
        </div>

        {/* Profile Stats */}
        <ProfileStats userEmail={userEmail} />

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-5">
          {sections.map((section) => (
            <div key={section.label || 'home'}>
              {/* Section label — skip if empty */}
              {section.label && (
                <p
                  className="text-[9px] px-3 mb-1.5 font-semibold tracking-widest uppercase"
                  style={{ color: 'rgba(255,255,255,0.18)' }}
                >
                  {section.label}
                </p>
              )}
              {/* Items */}
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon, exact, color }) => {
                  const tourId =
                    href === '/dashboard/competitors' ? 'nav-competitors' :
                    undefined
                  return (
                    <div key={href} data-tour={tourId}>
                      <NavLink
                        href={href}
                        label={label}
                        icon={icon}
                        exact={exact}
                        accentColor={color}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

        </nav>

        {/* User Menu */}
        <UserMenu userEmail={userEmail} />
      </aside>
  )
}
