'use client'

import { useEffect, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminSession } from '@/components/admin/AdminSessionProvider'
import { adminFetch } from '@/lib/adminApi'
import { Button } from '@/components/ui/Button'
import { Copy, RefreshCw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type TokenRecord = {
  id: string
  eligible_models?: string[]
  environment?: string | null
  created_at?: string
  updated_at?: string
  router_model_preference?: string | null
  user_id?: string | null
}

type TokenListResponse = { tokens: TokenRecord[]; count?: number }

type CreateTokenResponse = { id: string; token: string; config?: { eligible_models?: string[] } }

type RotateTokenResponse = { token: string }

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

export default function AdminTokensPage() {
  const { session } = useAdminSession()
  const [tokens, setTokens] = useState<TokenRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [modelInput, setModelInput] = useState('')
  const [eligibleModels, setEligibleModels] = useState<string[]>([])
  const [createToken, setCreateToken] = useState<string | null>(null)
  const [copyLabel, setCopyLabel] = useState('')

  const loadTokens = async () => {
    if (!session?.token) return
    setIsLoading(true)
    setError('')

    try {
      const data = await adminFetch<TokenListResponse>('/admin/tokens', {
        sessionToken: session.token,
      })
      setTokens(data.tokens || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load tokens.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTokens()
  }, [session?.token])

  const addModel = (value: string) => {
    const cleaned = value.trim().replace(/,$/, '')
    if (!cleaned) return
    setEligibleModels((prev) => (prev.includes(cleaned) ? prev : [...prev, cleaned]))
  }

  const handleModelKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addModel(modelInput)
      setModelInput('')
    }
  }

  const handleCreateToken = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session?.token) return
    if (eligibleModels.length === 0) {
      setError('Add at least one eligible model before creating a token.')
      return
    }

    setIsLoading(true)
    setCreateToken(null)
    setError('')

    try {
      const data = await adminFetch<CreateTokenResponse>('/admin/tokens', {
        method: 'POST',
        sessionToken: session.token,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eligible_models: eligibleModels }),
      })

      setCreateToken(data.token)
      setEligibleModels(data.config?.eligible_models || eligibleModels)
      setModelInput('')
      await loadTokens()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create token.')
    } finally {
      setIsLoading(false)
    }
  }

  const rotateToken = async (tokenId: string) => {
    if (!session?.token) return
    setIsLoading(true)
    setError('')
    setCreateToken(null)

    try {
      const data = await adminFetch<RotateTokenResponse>(`/admin/tokens/${tokenId}/rotate`, {
        method: 'POST',
        sessionToken: session.token,
      })
      setCreateToken(data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to rotate token.')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteToken = async (tokenId: string) => {
    if (!session?.token) return
    const confirmed = window.confirm('Delete this token? This cannot be undone.')
    if (!confirmed) return

    setIsLoading(true)
    setError('')

    try {
      await adminFetch(`/admin/tokens/${tokenId}`, {
        method: 'DELETE',
        sessionToken: session.token,
      })
      await loadTokens()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete token.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopyLabel('Token copied')
      window.setTimeout(() => setCopyLabel(''), 2000)
    } catch {
      setCopyLabel('Copy failed')
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Admin Tokens"
        description="Create, rotate, and revoke API tokens with full configuration visibility."
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Token inventory</h2>
            <Button type="button" variant="secondary" size="sm" onClick={loadTokens} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-gray-950 dark:text-gray-400">
                <tr>
                  <th className="px-3 py-2">Token ID</th>
                  <th className="px-3 py-2">Eligible models</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {tokens.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={4}>
                      No admin tokens found.
                    </td>
                  </tr>
                )}
                {tokens.map((token) => (
                  <tr key={token.id}>
                    <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{token.id}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-gray-300">
                      {token.eligible_models?.length ? token.eligible_models.join(', ') : '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{formatDate(token.created_at)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => rotateToken(token.id)}
                          disabled={isLoading}
                        >
                          Rotate
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteToken(token.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create token</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Eligible models are immutable after creation.
          </p>

          <form onSubmit={handleCreateToken} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Eligible models</label>
              <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 dark:border-gray-700 dark:bg-gray-950">
                {eligibleModels.map((model) => (
                  <span
                    key={model}
                    className="flex items-center gap-1 rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700"
                  >
                    {model}
                    <button
                      type="button"
                      onClick={() => setEligibleModels((prev) => prev.filter((item) => item !== model))}
                      className="text-brand-700 hover:text-brand-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={modelInput}
                  onChange={(event) => setModelInput(event.target.value)}
                  onKeyDown={handleModelKeyDown}
                  placeholder="gpt-4-turbo"
                  className="min-w-[140px] flex-1 bg-transparent text-gray-900 outline-none dark:text-white"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Press Enter or comma to add multiple models.</p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create token'}
            </Button>
          </form>

          {createToken && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Token created. Copy it now — it will only be shown once.</p>
              <div className="mt-3 flex flex-col gap-3">
                <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-xs">
                  {createToken}
                </div>
                <Button type="button" variant="secondary" onClick={() => handleCopy(createToken)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy token
                </Button>
                {copyLabel && (
                  <p className={cn('text-xs', copyLabel === 'Copy failed' ? 'text-red-600' : 'text-emerald-700')}>
                    {copyLabel}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
