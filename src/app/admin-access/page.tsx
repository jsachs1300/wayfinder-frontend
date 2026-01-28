'use client'

import { useMemo, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { getSession, setSession } from '@/lib/sessionStore'

export default function AdminAccessPage() {
  const session = useMemo(() => getSession(), [])
  const [adminKey, setAdminKey] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const apiUrl = (path: string) => (path.startsWith('/') ? path : `/${path}`)

  const handleElevate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!session?.token) {
      setMessage('Sign in to your user account before elevating to admin.')
      return
    }
    if (!adminKey.trim()) {
      setMessage('Enter an admin API key.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(apiUrl('/api/sessions/elevate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': session.token,
        },
        body: JSON.stringify({ admin_api_key: adminKey.trim() }),
      })

      const data = (await response.json().catch(() => null)) as
        | { session_token?: string; session?: { is_admin?: boolean } }
        | null

      if (!response.ok || !data?.session_token || !data.session?.is_admin) {
        setMessage('Unable to elevate. Check the admin key and try again.')
        return
      }

      setSession({ token: data.session_token, isAdmin: true })
      setMessage('Admin session active. You can open the admin console.')
    } catch {
      setMessage('Unable to elevate. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16 dark:bg-gray-950">
      <Container>
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            Admin Access
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            Elevate your session
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            Enter an admin API key to elevate the current session.
          </p>

          <form onSubmit={handleElevate} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Admin API key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(event) => setAdminKey(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                placeholder="wf_admin_..."
              />
            </div>

            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? 'Elevating...' : 'Elevate session'}
            </Button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-slate-600" aria-live="polite">
              {message}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/console">
              <Button variant="secondary">Return to token dashboard</Button>
            </a>
            <a href="/admin">
              <Button>Open admin console</Button>
            </a>
          </div>
        </div>
      </Container>
    </div>
  )
}
