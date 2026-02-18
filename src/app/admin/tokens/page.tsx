'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminSession } from '@/components/admin/AdminSessionProvider'
import { adminFetch } from '@/lib/adminApi'
import { Button } from '@/components/ui/Button'
import { Copy, RefreshCw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type TokenRecord = {
  id: string
  name?: string | null
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

type AdminModelRecord = {
  id: string
  provider?: string
}

type AdminModelsResponse = {
  models?: AdminModelRecord[]
  count?: number
  default?: string
}

type DefaultTokenProfile = {
  model_ids?: string[]
  version?: number
  updated_at?: string
  updated_by?: string
}

type DefaultTokenProfileResponse = {
  profile?: DefaultTokenProfile
  effective_model_ids?: string[]
  missing_model_ids?: string[]
  cache_scope?: string
  recommended_model_ids?: string[]
  cache_flush_recommended?: boolean
  cache_flush_hint?: string
  timestamp?: string
}

const DEFAULT_TOKEN_NAME = 'Default Token'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

const isDefaultToken = (token: TokenRecord) => token.name === DEFAULT_TOKEN_NAME

export default function AdminTokensPage() {
  const { session } = useAdminSession()
  const [tokens, setTokens] = useState<TokenRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [modelInput, setModelInput] = useState('')
  const [eligibleModels, setEligibleModels] = useState<string[]>([])
  const [createToken, setCreateToken] = useState<string | null>(null)
  const [copyLabel, setCopyLabel] = useState('')

  const [catalogModels, setCatalogModels] = useState<AdminModelRecord[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState('')

  const [profileModelInput, setProfileModelInput] = useState('')
  const [profileModelIds, setProfileModelIds] = useState<string[]>([])
  const [effectiveProfileModels, setEffectiveProfileModels] = useState<string[]>([])
  const [missingProfileModels, setMissingProfileModels] = useState<string[]>([])
  const [recommendedProfileModels, setRecommendedProfileModels] = useState<string[]>([])
  const [profileVersion, setProfileVersion] = useState<number | null>(null)
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string | null>(null)
  const [profileUpdatedBy, setProfileUpdatedBy] = useState<string | null>(null)
  const [profileCacheScope, setProfileCacheScope] = useState<string | null>(null)
  const [cacheFlushRecommended, setCacheFlushRecommended] = useState(false)
  const [cacheFlushHint, setCacheFlushHint] = useState('')
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileMessage, setProfileMessage] = useState('')

  const catalogModelIdSet = useMemo(
    () => new Set(catalogModels.map((model) => model.id)),
    [catalogModels]
  )

  const applyDefaultProfileResponse = (data: DefaultTokenProfileResponse) => {
    setProfileModelIds(data.profile?.model_ids || [])
    setEffectiveProfileModels(data.effective_model_ids || [])
    setMissingProfileModels(data.missing_model_ids || [])
    setRecommendedProfileModels(data.recommended_model_ids || [])
    setProfileVersion(typeof data.profile?.version === 'number' ? data.profile.version : null)
    setProfileUpdatedAt(data.profile?.updated_at || null)
    setProfileUpdatedBy(data.profile?.updated_by || null)
    setProfileCacheScope(data.cache_scope || null)
    setCacheFlushRecommended(Boolean(data.cache_flush_recommended))
    setCacheFlushHint(data.cache_flush_hint || '')
  }

  const loadTokens = useCallback(async () => {
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
  }, [session?.token])

  const loadCatalogModels = useCallback(async () => {
    if (!session?.token) return
    setIsCatalogLoading(true)
    setCatalogError('')

    try {
      const data = await adminFetch<AdminModelsResponse>('/admin/models', {
        sessionToken: session.token,
      })
      setCatalogModels(data.models || [])
    } catch (err) {
      setCatalogError(err instanceof Error ? err.message : 'Unable to load model catalog.')
      setCatalogModels([])
    } finally {
      setIsCatalogLoading(false)
    }
  }, [session?.token])

  const loadDefaultTokenProfile = useCallback(async () => {
    if (!session?.token) return
    setIsProfileLoading(true)
    setProfileError('')

    try {
      const data = await adminFetch<DefaultTokenProfileResponse>('/admin/default-token-profile', {
        sessionToken: session.token,
      })
      applyDefaultProfileResponse(data)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Unable to load default token profile.')
      setProfileModelIds([])
      setEffectiveProfileModels([])
      setMissingProfileModels([])
      setRecommendedProfileModels([])
      setProfileVersion(null)
      setProfileUpdatedAt(null)
      setProfileUpdatedBy(null)
      setProfileCacheScope(null)
      setCacheFlushRecommended(false)
      setCacheFlushHint('')
    } finally {
      setIsProfileLoading(false)
    }
  }, [session?.token])

  useEffect(() => {
    if (!session?.token) return
    void Promise.all([loadTokens(), loadCatalogModels(), loadDefaultTokenProfile()])
  }, [loadCatalogModels, loadDefaultTokenProfile, loadTokens, session?.token])

  const addCreateModel = (value: string) => {
    const cleaned = value.trim().replace(/,$/, '')
    if (!cleaned) return
    setEligibleModels((prev) => (prev.includes(cleaned) ? prev : [...prev, cleaned]))
  }

  const addProfileModel = (value: string) => {
    const cleaned = value.trim().replace(/,$/, '')
    if (!cleaned) return
    setProfileModelIds((prev) => (prev.includes(cleaned) ? prev : [...prev, cleaned]))
  }

  const handleCreateModelKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addCreateModel(modelInput)
      setModelInput('')
    }
  }

  const handleProfileModelKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addProfileModel(profileModelInput)
      setProfileModelInput('')
    }
  }

  const handleCreateToken = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session?.token) return

    const nextEligibleModels = modelInput.trim() ? [...eligibleModels, modelInput.trim()] : eligibleModels
    if (modelInput.trim()) {
      addCreateModel(modelInput)
      setModelInput('')
    }

    const normalizedEligibleModels = Array.from(new Set(nextEligibleModels.map((model) => model.trim()).filter(Boolean)))

    if (catalogModels.length > 0 && normalizedEligibleModels.length > 0) {
      const invalid = normalizedEligibleModels.filter((modelId) => !catalogModelIdSet.has(modelId))
      if (invalid.length > 0) {
        setError(`Unknown model IDs: ${invalid.join(', ')}. Use models from /admin/models.`)
        return
      }
    }

    const payload: { eligible_models?: string[] } = {}
    if (normalizedEligibleModels.length > 0) {
      payload.eligible_models = normalizedEligibleModels
    }

    setIsLoading(true)
    setCreateToken(null)
    setError('')

    try {
      const data = await adminFetch<CreateTokenResponse>('/admin/tokens', {
        method: 'POST',
        sessionToken: session.token,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setCreateToken(data.token)
      setEligibleModels(data.config?.eligible_models || payload.eligible_models || [])
      await loadTokens()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create token.')
    } finally {
      setIsLoading(false)
    }
  }

  const saveDefaultTokenProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session?.token) return

    const nextModelIds = profileModelInput.trim() ? [...profileModelIds, profileModelInput.trim()] : profileModelIds
    if (profileModelInput.trim()) {
      addProfileModel(profileModelInput)
      setProfileModelInput('')
    }

    const normalizedModelIds = Array.from(new Set(nextModelIds.map((model) => model.trim()).filter(Boolean)))

    if (catalogModels.length > 0 && normalizedModelIds.length > 0) {
      const invalid = normalizedModelIds.filter((modelId) => !catalogModelIdSet.has(modelId))
      if (invalid.length > 0) {
        setProfileError(`Unknown model IDs: ${invalid.join(', ')}. Load from /admin/models before saving.`)
        return
      }
    }

    setIsProfileSaving(true)
    setProfileError('')
    setProfileMessage('')

    try {
      const data = await adminFetch<DefaultTokenProfileResponse>('/admin/default-token-profile', {
        method: 'PUT',
        sessionToken: session.token,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_ids: normalizedModelIds }),
      })
      applyDefaultProfileResponse(data)
      setProfileMessage('Default-token profile updated.')
      await loadTokens()
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Unable to save default-token profile.')
    } finally {
      setIsProfileSaving(false)
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

  const clearGlobalCache = async () => {
    if (!session?.token) return
    setIsClearingCache(true)
    setProfileError('')

    try {
      await adminFetch('/admin/cache/clear', {
        method: 'POST',
        sessionToken: session.token,
      })
      setProfileMessage('Global cache cleared.')
      setCacheFlushRecommended(false)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Unable to clear global cache.')
    } finally {
      setIsClearingCache(false)
    }
  }

  const applyRecommendedModels = () => {
    if (recommendedProfileModels.length === 0) {
      setProfileMessage('No recommended models are available right now.')
      return
    }
    setProfileModelIds(recommendedProfileModels)
    setProfileMessage(
      `Loaded ${recommendedProfileModels.length} recommended model${recommendedProfileModels.length === 1 ? '' : 's'}. Review and save.`
    )
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

      {catalogError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {catalogError}
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
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Token ID</th>
                  <th className="px-3 py-2">Eligible models</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                {tokens.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={5}>
                      No admin tokens found.
                    </td>
                  </tr>
                )}
                {tokens.map((token) => (
                  <tr key={token.id}>
                    <td className="px-3 py-3 text-gray-900 dark:text-white">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{token.name || 'Untitled token'}</span>
                        {isDefaultToken(token) && (
                          <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                            default token
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600 dark:text-gray-300">{token.id}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-gray-300">
                      {token.eligible_models?.length ? token.eligible_models.join(', ') : '—'}
                      {isDefaultToken(token) && (
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-gray-400">
                          Resolved from the default-token profile.
                        </p>
                      )}
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

        <div className="space-y-6">
          <div
            id="default-token-profile"
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create token</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
              Eligible models are immutable after creation. Leave blank to use the default-token profile list.
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
                    list="admin-model-catalog"
                    value={modelInput}
                    onChange={(event) => setModelInput(event.target.value)}
                    onKeyDown={handleCreateModelKeyDown}
                    placeholder={isCatalogLoading ? 'Loading model catalog...' : 'gpt-4o-mini'}
                    className="min-w-[140px] flex-1 bg-transparent text-gray-900 outline-none dark:text-white"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">Press Enter or comma to add multiple models.</p>
                <p className="mt-1 text-xs text-slate-500">
                  {isCatalogLoading
                    ? 'Loading model catalog from /admin/models...'
                    : `${catalogModels.length} models loaded from /admin/models.`}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create token'}
              </Button>
            </form>

            {createToken && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="font-semibold">Token created. Copy it now - it will only be shown once.</p>
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

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Default-token profile</h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  void loadDefaultTokenProfile()
                  void loadCatalogModels()
                }}
                disabled={isProfileLoading || isCatalogLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
              System source of truth for default-token eligible models.
            </p>

            {profileError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {profileError}
              </div>
            )}

            {profileMessage && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                {profileMessage}
              </div>
            )}

            <form onSubmit={saveDefaultTokenProfile} className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Configured model IDs</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={applyRecommendedModels}
                    disabled={recommendedProfileModels.length === 0 || isProfileSaving}
                  >
                    Use recommended ({recommendedProfileModels.length})
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 dark:border-gray-700 dark:bg-gray-950">
                  {profileModelIds.map((model) => (
                    <span
                      key={model}
                      className="flex items-center gap-1 rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700"
                    >
                      {model}
                      <button
                        type="button"
                        onClick={() => setProfileModelIds((prev) => prev.filter((item) => item !== model))}
                        className="text-brand-700 hover:text-brand-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    list="admin-model-catalog"
                    value={profileModelInput}
                    onChange={(event) => setProfileModelInput(event.target.value)}
                    onKeyDown={handleProfileModelKeyDown}
                    placeholder="gpt-4o-mini"
                    className="min-w-[140px] flex-1 bg-transparent text-gray-900 outline-none dark:text-white"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Press Enter or comma to add model IDs. Validation is enforced on save.
                </p>
              </div>

              <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                <p>
                  <span className="font-semibold text-slate-700 dark:text-gray-200">Version:</span>{' '}
                  {profileVersion ?? '—'}
                </p>
                <p>
                  <span className="font-semibold text-slate-700 dark:text-gray-200">Updated:</span>{' '}
                  {formatDate(profileUpdatedAt)}
                </p>
                <p>
                  <span className="font-semibold text-slate-700 dark:text-gray-200">Updated by:</span>{' '}
                  {profileUpdatedBy || '—'}
                </p>
                <p>
                  <span className="font-semibold text-slate-700 dark:text-gray-200">Cache scope:</span>{' '}
                  {profileCacheScope || '—'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Effective model IDs</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {effectiveProfileModels.length > 0 ? (
                    effectiveProfileModels.map((model) => (
                      <span
                        key={model}
                        className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700"
                      >
                        {model}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No effective models.</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended model IDs</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recommendedProfileModels.length > 0 ? (
                    recommendedProfileModels.map((model) => (
                      <span
                        key={model}
                        className="rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700"
                      >
                        {model}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No recommendations returned.</span>
                  )}
                </div>
              </div>

              {missingProfileModels.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
                  <p className="font-semibold">Missing model IDs</p>
                  <p className="mt-1">{missingProfileModels.join(', ')}</p>
                  <p className="mt-2 text-amber-700">
                    These are read-only warnings. Update configured model IDs and save to remove missing entries.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isProfileSaving || isProfileLoading}>
                {isProfileSaving ? 'Saving profile...' : 'Save default-token profile'}
              </Button>
            </form>

            {cacheFlushHint && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-xs text-blue-900">
                <p className="font-semibold">Cache guidance</p>
                <p className="mt-1">{cacheFlushHint}</p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  onClick={clearGlobalCache}
                  disabled={isClearingCache || (!cacheFlushRecommended && !cacheFlushHint)}
                >
                  {isClearingCache ? 'Clearing...' : 'Clear global cache'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <datalist id="admin-model-catalog">
        {catalogModels.map((model) => (
          <option key={model.id} value={model.id}>
            {model.provider ? `${model.id} (${model.provider})` : model.id}
          </option>
        ))}
      </datalist>
    </div>
  )
}
