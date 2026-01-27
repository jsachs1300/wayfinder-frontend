'use client'

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { clearSession, setSession } from '@/lib/sessionStore'
import {
  CheckCircle2,
  Copy,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  ShieldX,
  Trash2,
} from 'lucide-react'

type ActiveTab = 'signup' | 'login'

type SignupStatus = 'idle' | 'loading' | 'success' | 'error'

type LoginStatus = 'idle' | 'loading' | 'success' | 'error'

type TokenActionStatus = 'idle' | 'loading' | 'success' | 'error'

type UserProfile = {
  email: string
  tier?: string | null
  status?: string | null
}

type TokenMeta = {
  id: string
  name?: string | null
  is_primary: boolean
  created_at?: string | null
  updated_at?: string | null
  rotated_at?: string | null
  environment?: string | null
  status?: string | null
  eligible_models?: string[]
  metrics?: {
    route_requests?: number
    cache_hits?: number
    throttled_requests?: number
  }
}

type RegisterResponse = {
  verification_token?: string
}

type LoginResponse = {
  session_token: string
  user: UserProfile
  tokens: TokenMeta[]
}

type CreateTokenResponse = {
  id: string
  token: string
  name?: string | null
  config?: {
    eligible_models?: string[]
  }
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

export function UserAccessConsole() {
  const params = useSearchParams()
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const apiUrl = (path: string) => {
    if (!apiBaseUrl) return path
    const base = apiBaseUrl.replace(/\/$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    if (base.endsWith('/api') && normalizedPath.startsWith('/api/')) {
      return `${base}${normalizedPath.slice(4)}`
    }
    return `${base}${normalizedPath}`
  }

  const logRequest = (label: string, url: string, options: RequestInit) => {
    if (process.env.NODE_ENV === 'production') return
    const headers = options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options.headers as Record<string, string> | undefined)
    const body = typeof options.body === 'string' ? options.body : undefined
    console.info(`[console:${label}]`, { url, method: options.method, headers, body })
  }
  const [activeTab, setActiveTab] = useState<ActiveTab>('signup')
  const [signupStatus, setSignupStatus] = useState<SignupStatus>('idle')
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle')
  const [tokenStatus, setTokenStatus] = useState<TokenActionStatus>('idle')
  const [createStatus, setCreateStatus] = useState<TokenActionStatus>('idle')

  const [signupEmail, setSignupEmail] = useState('')
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({})
  const [signupMessage, setSignupMessage] = useState('')
  const [verificationToken, setVerificationToken] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [tokens, setTokens] = useState<TokenMeta[]>([])
  const [newTokenSecret, setNewTokenSecret] = useState<string | null>(null)
  const [newTokenModels, setNewTokenModels] = useState<string[]>([])
  const [expandedTokenId, setExpandedTokenId] = useState<string | null>(null)
  const [rotatedTokenSecrets, setRotatedTokenSecrets] = useState<Record<string, string>>({})

  const [tokenMessage, setTokenMessage] = useState('')

  const [tokenName, setTokenName] = useState('')
  const [eligibleModels, setEligibleModels] = useState<string[]>([])
  const [modelInput, setModelInput] = useState('')
  const [createMessage, setCreateMessage] = useState('')

  const [copyLabel, setCopyLabel] = useState('')
  const dashboardRef = useRef<HTMLDivElement | null>(null)
  const [showSessionNotice, setShowSessionNotice] = useState(false)
  const [fadeSessionNotice, setFadeSessionNotice] = useState(false)


  useEffect(() => {
    if (!copyLabel) return
    const timeout = window.setTimeout(() => setCopyLabel(''), 1800)
    return () => window.clearTimeout(timeout)
  }, [copyLabel])

  useEffect(() => {
    const login = params.get('login')
    if (login) {
      setActiveTab('login')
    }
  }, [params])

  useEffect(() => {
    if (loginStatus !== 'success') return
    setShowSessionNotice(true)
    setFadeSessionNotice(false)
    const fadeTimeout = window.setTimeout(() => setFadeSessionNotice(true), 4500)
    const hideTimeout = window.setTimeout(() => {
      setShowSessionNotice(false)
      setFadeSessionNotice(false)
    }, 5000)
    return () => {
      window.clearTimeout(fadeTimeout)
      window.clearTimeout(hideTimeout)
    }
  }, [loginStatus])

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopyLabel(label)
    } catch {
      setCopyLabel('Copy failed')
    }
  }

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSignupMessage('')

    const nextErrors: Record<string, string> = {}
    if (!emailRegex.test(signupEmail.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    setSignupErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSignupStatus('loading')

    try {
      const url = apiUrl('/api/users/register')
      const options: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail.trim().toLowerCase(),
        }),
      }
      logRequest('register', url, options)
      const response = await fetch(url, options)

      const data = (await response.json().catch(() => null)) as RegisterResponse | null

      if (!response.ok) {
        if (response.status === 409) {
          setSignupErrors({ email: 'Email already registered.' })
        } else if (response.status === 400) {
          setSignupErrors({ email: 'Check the email address and try again.' })
        } else {
          setSignupMessage('Something went wrong. Please try again.')
        }
        setSignupStatus('error')
        return
      }

      setSignupStatus('success')
      setVerificationToken(data?.verification_token || '')
      setLoginEmail(signupEmail.trim().toLowerCase())
    } catch {
      setSignupMessage('Something went wrong. Please try again.')
      setSignupStatus('error')
    }
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginMessage('')

    if (!emailRegex.test(loginEmail.trim())) {
      setLoginMessage('Enter a valid email address.')
      return
    }

    setLoginStatus('loading')

    try {
      const url = apiUrl('/api/sessions/login')
      const options: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        }),
      }
      logRequest('login', url, options)
      const response = await fetch(url, options)

      const data = (await response.json().catch(() => null)) as LoginResponse | null
      if (!response.ok || !data) {
        if (response.status === 401) {
          setLoginMessage('Invalid email or password.')
        } else if (response.status === 403) {
          setLoginMessage('Account suspended. Contact support for help.')
        } else {
          setLoginMessage('Something went wrong. Please try again.')
        }
        setLoginStatus('error')
        return
      }

      setUserProfile(data.user)
      setSessionToken(data.session_token)
      setSession({ token: data.session_token, isAdmin: false })
      setTokens(data.tokens || [])
      setLoginStatus('success')
    } catch {
      setLoginMessage('Something went wrong. Please try again.')
      setLoginStatus('error')
    }
  }

  const handleResetRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResetMessage('')

    if (!emailRegex.test(resetEmail.trim())) {
      setResetMessage('Enter a valid email address.')
      return
    }

    try {
      await fetch(apiUrl('/api/users/password/forgot'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim().toLowerCase() }),
      })
      setResetMessage('If the email exists, a reset link has been sent.')
    } catch {
      setResetMessage('Unable to start password reset. Please try again.')
    }
  }


  const refreshTokens = async () => {
    if (!sessionToken) {
      setTokenMessage('Sign in to load tokens.')
      return
    }

    setTokenStatus('loading')
    setTokenMessage('')

    try {
      const url = apiUrl('/api/tokens')
      const options: RequestInit = {
        headers: { 'X-Session-Token': sessionToken },
      }
      logRequest('tokens:list', url, options)
      const response = await fetch(url, options)

      const data = (await response.json().catch(() => null)) as
        | { tokens: TokenMeta[] }
        | null

      if (!response.ok || !data) {
        setTokenMessage('Unable to load tokens. Check the token and try again.')
        setTokenStatus('error')
        return
      }

      setTokens(data.tokens || [])
      setTokenStatus('success')
    } catch {
      setTokenMessage('Unable to load tokens. Check the token and try again.')
      setTokenStatus('error')
    }
  }

  const handleLogout = async () => {
    if (!sessionToken) return
    try {
      await fetch(apiUrl('/api/sessions/logout'), {
        method: 'POST',
        headers: { 'X-Session-Token': sessionToken },
      })
    } catch {
      // Ignore logout errors; clear local state anyway.
    } finally {
      clearSession()
      setSessionToken(null)
      setUserProfile(null)
      setTokens([])
      setLoginStatus('idle')
    }
  }

  const deleteToken = async (token: TokenMeta) => {
    if (!sessionToken) {
      setTokenMessage('Sign in to delete tokens.')
      return
    }
    const confirmed = window.confirm('Delete this token? This cannot be undone.')
    if (!confirmed) return

    setTokenStatus('loading')
    setTokenMessage('')

    try {
      const url = apiUrl(`/api/tokens/${token.id}`)
      const options: RequestInit = {
        method: 'DELETE',
        headers: { 'X-Session-Token': sessionToken },
      }
      logRequest('tokens:delete', url, options)
      const response = await fetch(url, options)

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        setTokenMessage(data?.message || 'Unable to delete token. Please try again.')
        setTokenStatus('error')
        return
      }

      setTokens((prev) => prev.filter((item) => item.id !== token.id))
      setTokenStatus('success')
    } catch {
      setTokenMessage('Unable to delete token. Please try again.')
      setTokenStatus('error')
    }
  }

  const rotateToken = async (token: TokenMeta) => {
    if (!sessionToken) {
      setTokenMessage('Sign in to rotate tokens.')
      return
    }

    const confirmed = window.confirm(
      'Rotate this token? The current token will no longer be valid.'
    )
    if (!confirmed) return

    setTokenStatus('loading')
    setTokenMessage('')

    try {
      const response = await fetch(apiUrl(`/api/tokens/${token.id}/rotate`), {
        method: 'POST',
        headers: { 'X-Session-Token': sessionToken },
      })

      const data = (await response.json().catch(() => null)) as { token?: string } | null
      if (!response.ok || !data?.token) {
        setTokenMessage('Unable to rotate token. Please try again.')
        setTokenStatus('error')
        return
      }

      setRotatedTokenSecrets((prev) => ({ ...prev, [token.id]: data.token as string }))
      setTokenStatus('success')
    } catch {
      setTokenMessage('Unable to rotate token. Please try again.')
      setTokenStatus('error')
    }
  }

  const addModel = (value: string) => {
    const cleaned = value.trim().replace(/,$/, '')
    if (!cleaned) return
    setEligibleModels((prev) => {
      if (prev.includes(cleaned)) return prev
      return [...prev, cleaned]
    })
  }

  const handleModelKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addModel(modelInput)
      setModelInput('')
    }
  }

  const handleModelBlur = () => {
    if (modelInput.trim()) {
      addModel(modelInput)
      setModelInput('')
    }
  }

  const removeModel = (value: string) => {
    setEligibleModels((prev) => prev.filter((item) => item !== value))
  }

  const handleCreateToken = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreateMessage('')

    if (!sessionToken) {
      setCreateMessage('Sign in to create tokens.')
      return
    }

    if (eligibleModels.length === 0) {
      setCreateMessage('Add at least one eligible model.')
      return
    }

    setCreateStatus('loading')
    setNewTokenSecret(null)
    setNewTokenModels([])

    try {
      const url = apiUrl('/api/tokens')
      const options: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken,
        },
        body: JSON.stringify({
          eligible_models: eligibleModels,
          name: tokenName.trim() || undefined,
        }),
      }
      logRequest('tokens:create', url, options)
      const response = await fetch(url, options)

      const data = (await response.json().catch(() => null)) as CreateTokenResponse | null
      if (!response.ok || !data) {
        setCreateMessage('Unable to create token. Check the model list and try again.')
        setCreateStatus('error')
        return
      }

      setNewTokenSecret(data.token)
      setNewTokenModels(data.config?.eligible_models || eligibleModels)
      setTokens((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          is_primary: false,
          created_at: new Date().toISOString(),
        },
      ])
      setTokenName('')
      setEligibleModels([])
      setCreateStatus('success')
    } catch {
      setCreateMessage('Unable to create token. Check the model list and try again.')
      setCreateStatus('error')
    }
  }

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-slate-50 dark:bg-gray-950">
      <section className="py-16 md:py-20">
        <Container>
          <div
            className={cn(
              'grid gap-8',
              sessionToken ? 'lg:grid-cols-1' : 'lg:grid-cols-[0.95fr_1.05fr]'
            )}
          >
            {!sessionToken && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                      Account Access
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                      Create or access your account
                    </h2>
                  </div>
                  <div className="flex rounded-full bg-slate-100 p-1 dark:bg-gray-800">
                    {(['signup', 'login'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={cn(
                          'rounded-full px-4 py-1.5 text-sm font-medium transition',
                          activeTab === tab
                            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        )}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === 'signup' ? 'Register' : 'Login'}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === 'signup' ? (
                  <form onSubmit={handleSignupSubmit} className="mt-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="signup-email">
                        Email
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(event) => setSignupEmail(event.target.value)}
                        className={cn(
                          'mt-2 w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white',
                          signupErrors.email && 'border-red-400 focus:border-red-400 focus:ring-red-200'
                        )}
                        placeholder="you@company.com"
                        required
                      />
                      {signupErrors.email && (
                        <p className="mt-2 text-sm text-red-600">{signupErrors.email}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
                        We will email a verification link to finish registration.
                      </p>
                    </div>


                    <Button type="submit" size="lg" disabled={signupStatus === 'loading'}>
                      {signupStatus === 'loading' ? 'Sending verification...' : 'Send verification email'}
                    </Button>

                    {signupMessage && (
                      <p className="text-sm text-red-600" aria-live="polite">
                        {signupMessage}
                      </p>
                    )}

                    {signupStatus === 'success' && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                        <p className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="h-4 w-4" />
                          Check your email to verify and set a password.
                        </p>
                        {verificationToken && (
                          <div className="mt-3 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                            <p className="font-semibold">Verification token (non-prod only)</p>
                            <p className="mt-1 break-all font-mono">{verificationToken}</p>
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <Button type="button" onClick={() => setActiveTab('login')}>
                            Go to login
                          </Button>
                          <Link href={verificationToken ? `/verify?token=${verificationToken}` : '/verify'}>
                            <Button type="button" variant="secondary">
                              Verify email
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </form>
                ) : (
                  <>
                    <form onSubmit={handleLoginSubmit} className="mt-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="login-email">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        placeholder="you@company.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="login-password">
                        Password
                      </label>
                      <input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" disabled={loginStatus === 'loading'}>
                      {loginStatus === 'loading' ? 'Signing in...' : 'Sign in'}
                    </Button>

                    {loginMessage && (
                      <p className="text-sm text-red-600" aria-live="polite">
                        {loginMessage}
                      </p>
                    )}

                    <div className="text-sm">
                      <button
                        type="button"
                        className="text-brand-600 hover:text-brand-700"
                        onClick={() => setShowPasswordReset((prev) => !prev)}
                      >
                        {showPasswordReset ? 'Hide password reset' : 'Forgot password?'}
                      </button>
                    </div>
                  </form>

                    {showPasswordReset && (
                      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                        <p className="font-semibold text-gray-900 dark:text-white">Reset password</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
                          We will email a reset link. Links never confirm whether an email exists.
                        </p>

                        <form onSubmit={handleResetRequest} className="mt-4 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              Email
                            </label>
                            <input
                              type="email"
                              value={resetEmail}
                              onChange={(event) => setResetEmail(event.target.value)}
                              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                              placeholder="you@company.com"
                              required
                            />
                          </div>
                          <Button type="submit" variant="secondary">
                            Send reset link
                          </Button>
                        </form>

                        {resetMessage && (
                          <p className="mt-3 text-xs text-slate-600" aria-live="polite">
                            {resetMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {userProfile ? (
              <div
                ref={dashboardRef}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                      Token Dashboard
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                      Manage token inventory
                    </h2>
                  </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2"
                  onClick={refreshTokens}
                  disabled={tokenStatus === 'loading'}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh tokens
                </Button>
                {sessionToken && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-slate-600 hover:text-slate-800"
                    onClick={handleLogout}
                  >
                    Sign out
                  </Button>
                )}
              </div>

                {!sessionToken && (
                  <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400">
                    <p className="flex items-center gap-2 font-semibold text-slate-700 dark:text-gray-200">
                      <ShieldX className="h-4 w-4" />
                      Sign in to load and manage tokens.
                    </p>
                    {tokenMessage && (
                      <p className="mt-2 text-xs text-red-500">{tokenMessage}</p>
                    )}
                  </div>
                )}

                {showSessionNotice && (
                  <div
                    className={cn(
                      'mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 transition-opacity duration-500',
                      fadeSessionNotice ? 'opacity-0' : 'opacity-100'
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="h-4 w-4" />
                          Session active.
                        </p>
                        <p className="mt-1 text-xs text-emerald-700">
                          Session tokens stay in memory only. Reloading will clear them.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Token list</h3>
                    <span className="text-xs text-slate-500 dark:text-gray-400">
                      {tokens.length} tokens
                    </span>
                  </div>

                  {tokens.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400">
                      No tokens yet. Create one to access the API.
                    </div>
                  ) : (
                  <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-sm dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
                    {tokens.map((token) => (
                      <div
                        key={token.id}
                        className="grid gap-4 px-4 py-4 md:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr_0.7fr_0.7fr_0.6fr_auto] md:items-center"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedTokenId((prev) => (prev === token.id ? null : token.id))}
                          className="text-left"
                        >
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {token.name || 'Untitled token'}
                          </p>
                          <p className="text-xs text-slate-500">{token.id}</p>
                        </button>
                        <div>
                          <p className="text-xs uppercase text-slate-400">Created</p>
                          <p className="text-gray-700 dark:text-gray-300">{formatDate(token.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-400">Updated</p>
                          <p className="text-gray-700 dark:text-gray-300">{formatDate(token.updated_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-400">Route requests</p>
                          <p className="text-gray-700 dark:text-gray-300">
                            {token.metrics?.route_requests ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-400">Cache hits</p>
                          <p className="text-gray-700 dark:text-gray-300">
                            {token.metrics?.cache_hits ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-slate-400">Throttled</p>
                          <p className="text-gray-700 dark:text-gray-300">
                            {token.metrics?.throttled_requests ?? '—'}
                          </p>
                        </div>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-gray-800 dark:text-gray-300">
                            Standard
                          </span>
                        </div>
                        <div className="flex items-center justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            className="gap-2 text-red-600 hover:text-red-700"
                            onClick={() => deleteToken(token)}
                            disabled={tokenStatus === 'loading'}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                        {expandedTokenId === token.id && (
                          <div className="md:col-span-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase text-slate-500">Eligible models</p>
                                <p className="mt-2 flex flex-wrap gap-2">
                                  {(token.eligible_models || []).length ? (
                                    token.eligible_models?.map((model) => (
                                      <span
                                        key={model}
                                        className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700"
                                      >
                                        {model}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-slate-500">No models listed</span>
                                  )}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => rotateToken(token)}
                                disabled={tokenStatus === 'loading'}
                              >
                                Rotate token
                              </Button>
                            </div>
                            {rotatedTokenSecrets[token.id] && (
                              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                                <p className="font-semibold">New token created. Copy it now.</p>
                                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                                  <div className="flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-xs">
                                    {rotatedTokenSecrets[token.id]}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => handleCopy(rotatedTokenSecrets[token.id], 'Token copied')}
                                  >
                                    Copy
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                      setRotatedTokenSecrets((prev) => {
                                        const next = { ...prev }
                                        delete next[token.id]
                                        return next
                                      })
                                    }
                                  >
                                    Dismiss
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {tokenMessage && (
                  <p className="mt-3 text-xs text-red-500" aria-live="polite">
                    {tokenMessage}
                  </p>
                )}
              </div>

              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create token</h3>
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    Immutable configuration
                    </span>
                  </div>

                  <form onSubmit={handleCreateToken} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="token-name">
                        Token name (optional)
                      </label>
                      <input
                        id="token-name"
                        type="text"
                        value={tokenName}
                        onChange={(event) => setTokenName(event.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                        placeholder="Production access"
                      />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Eligible models
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 dark:border-gray-700 dark:bg-gray-950">
                        {eligibleModels.map((model) => (
                          <span
                            key={model}
                            className="flex items-center gap-1 rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700"
                          >
                            {model}
                            <button
                              type="button"
                              onClick={() => removeModel(model)}
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
                          onBlur={handleModelBlur}
                          placeholder="gpt-4o-mini"
                          className="min-w-[140px] flex-1 bg-transparent text-gray-900 outline-none dark:text-white"
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
                      Press Enter or comma to add multiple models. This list is locked after creation.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                      <p className="flex items-center gap-2 font-semibold text-slate-700 dark:text-gray-200">
                        <Lock className="h-4 w-4" />
                      Eligible model lists cannot be edited later.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={createStatus === 'loading'}
                    >
                      <Plus className="h-4 w-4" />
                      {createStatus === 'loading' ? 'Creating token...' : 'Create token'}
                    </Button>

                    {createMessage && (
                      <p className="text-xs text-red-500" aria-live="polite">
                        {createMessage}
                      </p>
                    )}

                    {newTokenSecret && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                        <p className="flex items-center gap-2 font-semibold">
                          <KeyRound className="h-4 w-4" />
                          New token created. This secret will not be shown again.
                        </p>
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-xs">
                            {newTokenSecret}
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            className="gap-2"
                            onClick={() => handleCopy(newTokenSecret, 'Token copied')}
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                        {newTokenModels.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs uppercase text-emerald-700">Eligible models</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {newTokenModels.map((model) => (
                                <span
                                  key={model}
                                  className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                                >
                                  {model}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {copyLabel && (
                          <p className="mt-3 text-xs text-emerald-700">{copyLabel}</p>
                        )}
                      </div>
                    )}
                </form>
              </div>

              <div className="mt-8 text-right text-xs text-slate-500">
                <Link href="/admin-access" className="hover:text-brand-600">
                  Admin
                </Link>
              </div>
            </div>
            ) : (
              <div
                ref={dashboardRef}
                className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
              >
                <p className="flex items-center justify-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                  <KeyRound className="h-4 w-4" />
                  Login required to view token dashboard
                </p>
                <p className="mt-2">
                  Sign in to access token management.
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  )
}
