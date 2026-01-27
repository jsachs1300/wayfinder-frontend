'use client'

import { useEffect, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminSession } from '@/components/admin/AdminSessionProvider'
import { adminFetch } from '@/lib/adminApi'
import { Button } from '@/components/ui/Button'

export default function AdminKnowledgePage() {
  const { session } = useAdminSession()
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [scope, setScope] = useState('global')
  const [tokenId, setTokenId] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadStats = async () => {
    if (!session?.token) return
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (scope) params.set('scope', scope)
      if (tokenId.trim()) params.set('token_id', tokenId.trim())
      const data = await adminFetch<Record<string, unknown>>(`/admin/knowledge/stats?${params.toString()}`, {
        sessionToken: session.token,
      })
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load knowledge stats.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [session?.token])

  return (
    <div>
      <AdminPageHeader
        title="Admin Knowledge"
        description="Review knowledge base coverage and decay lifecycle metrics."
      />

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        The knowledge decay endpoint is deprecated and currently returns 410.
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Scope</label>
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            >
              <option value="global">Global</option>
              <option value="token">Token</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Token ID</label>
            <input
              type="text"
              value={tokenId}
              onChange={(event) => setTokenId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              placeholder="Optional"
            />
          </div>
          <Button type="button" onClick={loadStats} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh stats'}
          </Button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600" aria-live="polite">
            {error}
          </p>
        )}

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
          <pre className="whitespace-pre-wrap">{stats ? JSON.stringify(stats, null, 2) : 'No data yet.'}</pre>
        </div>
      </div>
    </div>
  )
}
