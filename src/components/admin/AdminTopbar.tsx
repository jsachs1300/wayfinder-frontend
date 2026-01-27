'use client'

import { Compass, ShieldCheck } from 'lucide-react'
import { useAdminSession } from './AdminSessionProvider'
import { Button } from '@/components/ui/Button'

export function AdminTopbar() {
  const { signOut, isLoading, session } = useAdminSession()

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">
              Wayfinder Admin
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Control Center</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400">
          <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 md:inline-flex">
            <ShieldCheck className="h-4 w-4" />
            Admin session active
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={signOut}
            disabled={isLoading || !session}
          >
            Log out
          </Button>
        </div>
      </div>
    </header>
  )
}
