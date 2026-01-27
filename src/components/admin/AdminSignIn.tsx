'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Shield } from 'lucide-react'
import { useAdminSession } from './AdminSessionProvider'

export function AdminSignIn() {
  const { error } = useAdminSession()
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 dark:bg-gray-950">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">
              Admin Access
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Wayfinder Admin Sign In
            </h1>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-gray-300">
          Admin access is granted by elevating an existing user session. Visit the console to log in,
          then elevate with your admin key.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600" aria-live="polite">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/console">
            <Button size="lg">Go to User Console</Button>
          </Link>
          <Button variant="secondary" size="lg" onClick={() => window.location.reload()}>
            Refresh Admin Session
          </Button>
        </div>
      </div>
    </div>
  )
}
