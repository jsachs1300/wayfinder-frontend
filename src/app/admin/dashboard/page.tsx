'use client'

import { useEffect, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminSession } from '@/components/admin/AdminSessionProvider'
import { adminFetch } from '@/lib/adminApi'
import { Activity, KeyRound, Server, Users } from 'lucide-react'

type TokenSummary = { tokens?: unknown[]; count?: number }

type CacheStats = { hits?: number; misses?: number; stores?: number; hit_rate?: number }

type ModelStats = { models?: unknown[]; count?: number }

const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return '—'
  return new Intl.NumberFormat('en-US').format(value)
}

export default function AdminDashboardPage() {
  const { session } = useAdminSession()
  const [tokenCount, setTokenCount] = useState<number | null>(null)
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [modelCount, setModelCount] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.token) return

    const load = async () => {
      try {
        const [tokens, cache, models] = await Promise.all([
          adminFetch<TokenSummary>('/admin/tokens', { sessionToken: session.token }),
          adminFetch<CacheStats>('/admin/cache/stats', { sessionToken: session.token }),
          adminFetch<ModelStats>('/admin/models', { sessionToken: session.token }),
        ])

        setTokenCount(tokens.count ?? tokens.tokens?.length ?? 0)
        setCacheStats(cache)
        setModelCount(models.count ?? models.models?.length ?? 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load dashboard data.')
      }
    }

    load()
  }, [session?.token])

  return (
    <div>
      <AdminPageHeader
        title="Admin Dashboard"
        description="Monitor system health, token inventory, and cache performance from a single view."
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">
              Total Tokens
            </p>
            <KeyRound className="h-4 w-4 text-brand-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
            {tokenCount === null ? '—' : formatNumber(tokenCount)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Admin token inventory</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">
              Cache Hit Rate
            </p>
            <Server className="h-4 w-4 text-brand-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
            {cacheStats?.hit_rate !== undefined ? `${(cacheStats.hit_rate * 100).toFixed(1)}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-500">LangCache performance</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">
              Models Available
            </p>
            <Activity className="h-4 w-4 text-brand-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
            {modelCount === null ? '—' : formatNumber(modelCount)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Admin model catalog</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">
              Users
            </p>
            <Users className="h-4 w-4 text-brand-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">—</p>
          <p className="mt-1 text-xs text-slate-500">Requires admin users endpoint</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
        <p className="font-semibold text-gray-900 dark:text-white">Admin activity feed</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
          Recent admin actions will appear here once audit logging is enabled.
        </p>
      </div>
    </div>
  )
}
