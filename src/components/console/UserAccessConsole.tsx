'use client'

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
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
}

type SignupResponse = {
  user: UserProfile
  token: {
    id: string
    token: string
    name?: string | null
    is_primary: boolean
  }
}

type LoginResponse = {
  user: UserProfile
  tokens: TokenMeta[]
}

type CreateTokenResponse = {
  id: string
  token: string
  name?: string | null
  config?: {
    eligible_models?: string[]
    allowed_models?: string[]
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

const passwordChecks = (password: string) => {
  return {
    min: password.length >= 8,
    max: password.length <= 128,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
  }
}

export function UserAccessConsole() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('signup')
  const [signupStatus, setSignupStatus] = useState<SignupStatus>('idle')
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle')
  const [tokenStatus, setTokenStatus] = useState<TokenActionStatus>('idle')
  const [createStatus, setCreateStatus] = useState<TokenActionStatus>('idle')

  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({})
  const [signupMessage, setSignupMessage] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [tokens, setTokens] = useState<TokenMeta[]>([])
  const [signupTokenSecret, setSignupTokenSecret] = useState<string | null>(null)
  const [newTokenSecret, setNewTokenSecret] = useState<string | null>(null)
  const [newTokenModels, setNewTokenModels] = useState<string[]>([])

  const [authTokenInput, setAuthTokenInput] = useState('')
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [tokenMessage, setTokenMessage] = useState('')

  const [tokenName, setTokenName] = useState('')
  const [eligibleModels, setEligibleModels] = useState<string[]>([])
  const [modelInput, setModelInput] = useState('')
  const [createMessage, setCreateMessage] = useState('')

  const [copyLabel, setCopyLabel] = useState('')
  const dashboardRef = useRef<HTMLDivElement | null>(null)

  const passwordState = useMemo(() => passwordChecks(signupPassword), [signupPassword])
  const isPasswordValid = useMemo(
    () => Object.values(passwordState).every(Boolean),
    [passwordState]
  )

  useEffect(() => {
    if (!copyLabel) return
    const timeout = window.setTimeout(() => setCopyLabel(''), 1800)
    return () => window.clearTimeout(timeout)
  }, [copyLabel])

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
    if (!isPasswordValid) {
      nextErrors.password = 'Password does not meet all requirements.'
    }
    if (signupConfirmPassword !== signupPassword) {
      nextErrors.confirm = 'Passwords do not match.'
    }

    setSignupErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSignupStatus('loading')

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail.trim().toLowerCase(),
          password: signupPassword,
        }),
      })

      const data = (await response.json().catch(() => null)) as SignupResponse | null
      if (!response.ok || !data) {
        if (response.status === 409) {
          setSignupErrors({ email: 'Email already registered.' })
        } else if (response.status === 400) {
          setSignupErrors({ password: 'Check the password requirements and try again.' })
        } else {
          setSignupMessage('Something went wrong. Please try again.')
        }
        setSignupStatus('error')
        return
      }

      setUserProfile(data.user)
      setTokens([
        {
          id: data.token.id,
          name: data.token.name,
          is_primary: data.token.is_primary,
        },
      ])
      setSignupTokenSecret(data.token.token)
      setAuthToken(data.token.token)
      setSignupStatus('success')
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
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        }),
      })

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
      setTokens(data.tokens || [])
      setLoginStatus('success')
    } catch {
      setLoginMessage('Something went wrong. Please try again.')
      setLoginStatus('error')
    }
  }

  const saveAuthToken = () => {
    const value = authTokenInput.trim()
    if (!value) {
      setTokenMessage('Paste a token secret to continue.')
      return
    }
    setTokenMessage('')
    setAuthToken(value)

  }

  const clearAuthToken = () => {
    setAuthToken(null)
    setAuthTokenInput('')
  }

  const refreshTokens = async () => {
    if (!authToken) {
      setTokenMessage('Add a token secret to load tokens.')
      return
    }

    setTokenStatus('loading')
    setTokenMessage('')

    try {
      const response = await fetch('/api/tokens', {
        headers: { 'X-Wayfinder-Token': authToken },
      })

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

  const deleteToken = async (token: TokenMeta) => {
    if (!authToken) {
      setTokenMessage('Add a token secret to delete tokens.')
      return
    }
    if (token.is_primary) {
      setTokenMessage('Cannot delete primary token.')
      return
    }

    const confirmed = window.confirm('Delete this token? This cannot be undone.')
    if (!confirmed) return

    setTokenStatus('loading')
    setTokenMessage('')

    try {
      const response = await fetch(`/api/tokens/${token.id}`, {
        method: 'DELETE',
        headers: { 'X-Wayfinder-Token': authToken },
      })

      if (!response.ok) {
        setTokenMessage('Unable to delete token. Please try again.')
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

    if (!authToken) {
      setCreateMessage('Add a token secret to create tokens.')
      return
    }

    if (eligibleModels.length === 0) {
      setCreateMessage('Add at least one allowed model.')
      return
    }

    setCreateStatus('loading')
    setNewTokenSecret(null)
    setNewTokenModels([])

    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Wayfinder-Token': authToken,
        },
        body: JSON.stringify({
          allowed_models: eligibleModels,
          name: tokenName.trim() || undefined,
        }),
      })

      const data = (await response.json().catch(() => null)) as CreateTokenResponse | null
      if (!response.ok || !data) {
        setCreateMessage('Unable to create token. Check the model list and try again.')
        setCreateStatus('error')
        return
      }

      setNewTokenSecret(data.token)
      setNewTokenModels(data.config?.allowed_models || data.config?.eligible_models || eligibleModels)
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

  const passwordHints = [
    { key: 'min', label: 'At least 8 characters' },
    { key: 'max', label: 'No more than 128 characters' },
    { key: 'upper', label: 'One uppercase letter' },
    { key: 'lower', label: 'One lowercase letter' },
    { key: 'digit', label: 'One number' },
  ]

  return (
    <div className="bg-slate-50 dark:bg-gray-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent-400/30 blur-3xl" />
        <Container>
          <div className="relative grid gap-10 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-200">
                User Access Console
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
                Signup, login, and token creation with zero guesswork.
              </h1>
              <p className="mt-4 text-lg text-slate-200">
                Everything you need to create accounts, authenticate, and manage API tokens lives here.
                Token secrets are shown once and protected by clear, explicit warnings.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                  Token secrets shown once
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                  Password rules enforced upfront
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                  Immutable token configs
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-10 w-10 text-brand-200" />
                <div>
                  <h2 className="text-xl font-semibold">Security reminders</h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                      Token secrets never return after creation. Copy and store them now.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                      Login only shows token metadata. To manage tokens, paste an existing secret.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                      Allowed model lists cannot be edited after token creation.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
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
                      {tab === 'signup' ? 'Sign Up' : 'Login'}
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="signup-password">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
                      className={cn(
                        'mt-2 w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white',
                        signupErrors.password && 'border-red-400 focus:border-red-400 focus:ring-red-200'
                      )}
                      required
                    />
                    {signupErrors.password && (
                      <p className="mt-2 text-sm text-red-600">{signupErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="signup-confirm">
                      Confirm password
                    </label>
                    <input
                      id="signup-confirm"
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(event) => setSignupConfirmPassword(event.target.value)}
                      className={cn(
                        'mt-2 w-full rounded-lg border px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white',
                        signupErrors.confirm && 'border-red-400 focus:border-red-400 focus:ring-red-200'
                      )}
                      required
                    />
                    {signupErrors.confirm && (
                      <p className="mt-2 text-sm text-red-600">{signupErrors.confirm}</p>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                    <p className="font-semibold text-slate-700 dark:text-gray-200">Password checklist</p>
                    <div className="mt-2 grid gap-2">
                      {passwordHints.map((hint) => {
                        const isMet = passwordState[hint.key as keyof typeof passwordState]
                        return (
                          <div key={hint.key} className="flex items-center gap-2">
                            <span
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-full border text-xs',
                                isMet
                                  ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                                  : 'border-slate-300 bg-white text-slate-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500'
                              )}
                            >
                              {isMet ? '✓' : '•'}
                            </span>
                            <span>{hint.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Button type="submit" size="lg" disabled={signupStatus === 'loading'}>
                    {signupStatus === 'loading' ? 'Creating account...' : 'Create account'}
                  </Button>

                  {signupMessage && (
                    <p className="text-sm text-red-600" aria-live="polite">
                      {signupMessage}
                    </p>
                  )}

                  {signupStatus === 'success' && signupTokenSecret && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      <p className="flex items-center gap-2 font-semibold">
                        <KeyRound className="h-4 w-4" />
                        Your API token is shown once. Copy and store it securely.
                      </p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-xs">
                          {signupTokenSecret}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          className="gap-2"
                          onClick={() => handleCopy(signupTokenSecret, 'Token copied')}
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Button type="button" onClick={scrollToDashboard}>
                          Continue to dashboard
                        </Button>
                        {copyLabel && (
                          <span className="text-xs text-emerald-700">{copyLabel}</span>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              ) : (
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

                  {loginStatus === 'success' && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      <p className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="h-4 w-4" />
                        Login does not return token secrets. Paste an existing token to manage the dashboard.
                      </p>
                    </div>
                  )}
                </form>
              )}

              {userProfile && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">
                    Profile summary
                  </p>
                  <dl className="mt-3 grid gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-between">
                      <dt>Email</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{userProfile.email}</dd>
                    </div>
                    {userProfile.tier && (
                      <div className="flex items-center justify-between">
                        <dt>Tier</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{userProfile.tier}</dd>
                      </div>
                    )}
                    {userProfile.status && (
                      <div className="flex items-center justify-between">
                        <dt>Status</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{userProfile.status}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>

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
                </div>

                {!authToken && (
                  <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400">
                    <p className="flex items-center gap-2 font-semibold text-slate-700 dark:text-gray-200">
                      <ShieldX className="h-4 w-4" />
                      To manage tokens, paste an existing token secret.
                    </p>
                    <div className="mt-3 flex flex-col gap-3">
                      <input
                        type="password"
                        value={authTokenInput}
                        onChange={(event) => setAuthTokenInput(event.target.value)}
                        placeholder="wf_..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <Button type="button" onClick={saveAuthToken}>
                          Save token
                        </Button>
                        {tokenMessage && (
                          <span className="text-xs text-red-500">{tokenMessage}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {authToken && (
                  <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 font-semibold">
                          <ShieldCheck className="h-4 w-4" />
                          Token secret stored for this session only
                        </p>
                        <p className="mt-1 text-xs text-emerald-700">
                          It stays in memory only. Reloading will clear it.
                        </p>
                      </div>
                      <Button type="button" variant="secondary" onClick={clearAuthToken}>
                        Forget token
                      </Button>
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
                          className="grid gap-4 px-4 py-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr_auto] md:items-center"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {token.name || 'Untitled token'}
                            </p>
                            <p className="text-xs text-slate-500">{token.id}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-slate-400">Created</p>
                            <p className="text-gray-700 dark:text-gray-300">{formatDate(token.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-slate-400">Updated</p>
                            <p className="text-gray-700 dark:text-gray-300">{formatDate(token.updated_at)}</p>
                          </div>
                          <div>
                            {token.is_primary ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                                <Lock className="h-3 w-3" />
                                Primary
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-gray-800 dark:text-gray-300">
                                Standard
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              className="gap-2 text-red-600 hover:text-red-700"
                              onClick={() => deleteToken(token)}
                              disabled={token.is_primary || tokenStatus === 'loading'}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
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
                      Allowed models
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
                      Allowed model lists cannot be edited later.
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
                          <p className="text-xs uppercase text-emerald-700">Allowed models</p>
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
                  Complete signup or sign in to access token management.
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  )
}
