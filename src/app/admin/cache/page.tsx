'use client'

import { useEffect, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminSession } from '@/components/admin/AdminSessionProvider'
import { adminFetch } from '@/lib/adminApi'
import { Button } from '@/components/ui/Button'

type CacheStats = { hits?: number; misses?: number; stores?: number; hit_rate?: number }

export default function AdminCachePage() {
  const { session } = useAdminSession()
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [tokenId, setTokenId] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadStats = async () => {
    if (!session?.token) return
    setIsLoading(true)
    setError('')

    try {
      const data = await adminFetch<CacheStats>('/admin/cache/stats', {
        sessionToken: session.token,
      })
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load cache stats.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [session?.token])

  const clearCache = async (targetTokenId?: string) => {
    if (!session?.token) return
    setIsLoading(true)
    setError('')

    try {
      await adminFetch('/admin/cache/clear', {
        method: 'POST',
        sessionToken: session.token,
        headers: { 'Content-Type': 'application/json' },
        body: targetTokenId ? JSON.stringify({ token_id: targetTokenId }) : undefined,
      })
      await loadStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to clear cache.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Admin Cache"
        description="Inspect cache utilization and clear cached entries globally or by token."
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cache statistics</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
              Hits: <span className="font-semibold text-gray-900 dark:text-white">{stats?.hits ?? '—'}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
              Misses: <span className="font-semibold text-gray-900 dark:text-white">{stats?.misses ?? '—'}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
              Stores: <span className="font-semibold text-gray-900 dark:text-white">{stats?.stores ?? '—'}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
              Hit rate: <span className="font-semibold text-gray-900 dark:text-white">{stats?.hit_rate ? `${(stats.hit_rate * 100).toFixed(1)}%` : '—'}</span>
            </div>
          </div>
          <Button type="button" className="mt-4" onClick={loadStats} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh stats'}
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clear cache</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            Clear cached responses globally or by token ID.
          </p>
          <div className="mt-4 space-y-3">
            <Button type="button" variant="secondary" onClick={() => clearCache()} disabled={isLoading}>
              Clear global cache
            </Button>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Token ID</label>
              <input
                type="text"
                value={tokenId}
                onChange={(event) => setTokenId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                placeholder="Optional token ID"
              />
              <Button
                type="button"
                className="mt-3"
                onClick={() => clearCache(tokenId.trim())}
                disabled={isLoading || !tokenId.trim()}
              >
                Clear token cache
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
