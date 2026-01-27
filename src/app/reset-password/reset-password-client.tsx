'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { CheckCircle2 } from 'lucide-react'

const passwordChecks = (password: string) => ({
  min: password.length >= 8,
  max: password.length <= 128,
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  digit: /\d/.test(password),
})

export default function ResetPasswordClient() {
  const params = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const router = useRouter()

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const apiUrl = (path: string) => {
    if (!apiBaseUrl) return path
    const base = apiBaseUrl.replace(/\/$/, '')
    return `${base}${path.startsWith('/') ? path : `/${path}`}`
  }

  useEffect(() => {
    const queryToken = params.get('token')
    if (queryToken) {
      setToken(queryToken)
    }
  }, [params])

  useEffect(() => {
    if (!isDone) return
    const timeout = window.setTimeout(() => {
      router.push('/console?login=1')
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [isDone, router])

  const passwordState = useMemo(() => passwordChecks(password), [password])
  const isPasswordValid = useMemo(
    () => Object.values(passwordState).every(Boolean),
    [passwordState]
  )

  const passwordHints = [
    { key: 'min', label: 'At least 8 characters' },
    { key: 'max', label: 'No more than 128 characters' },
    { key: 'upper', label: 'One uppercase letter' },
    { key: 'lower', label: 'One lowercase letter' },
    { key: 'digit', label: 'One number' },
  ]

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!token.trim()) {
      setMessage('Reset token is missing. Please use the link from your email.')
      return
    }
    if (!isPasswordValid) {
      setMessage('Password does not meet all requirements.')
      return
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(apiUrl('/api/users/password/reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), password }),
      })

      if (!response.ok) {
        setMessage('Unable to reset password. Please try again.')
        return
      }

      setIsDone(true)
    } catch {
      setMessage('Unable to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 dark:bg-gray-950">
      <Container>
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            Password Reset
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            Enter a new password to regain access to your account.
          </p>

          {!isDone ? (
            <form onSubmit={handleReset} className="mt-6 space-y-4">
              {!token && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Reset token
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    placeholder="Paste token from email"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                {passwordHints.map((hint) => {
                  const isMet = passwordState[hint.key as keyof typeof passwordState]
                  return (
                    <div key={hint.key} className="flex items-center gap-2">
                      <span
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full border text-[10px]',
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
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Set password'}
              </Button>
            </form>
          ) : (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Password updated. Redirecting to login...
              </p>
            </div>
          )}

          {message && (
            <p className="mt-4 text-sm text-red-600" aria-live="polite">
              {message}
            </p>
          )}
        </div>
      </Container>
    </div>
  )
}
