'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import {
  Gauge,
  Users,
  KeyRound,
  WandSparkles,
  Database,
  Layers,
  Server,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/tokens', label: 'Tokens', icon: KeyRound },
  { href: '/admin/tokens#default-token-profile', label: 'Default Token Profile', icon: WandSparkles },
  { href: '/admin/knowledge', label: 'Knowledge', icon: Database },
  { href: '/admin/registry', label: 'Registry', icon: Layers },
  { href: '/admin/cache', label: 'Cache', icon: Server },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full max-w-[220px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">
          Admin Navigation
        </p>
        <nav className="mt-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
