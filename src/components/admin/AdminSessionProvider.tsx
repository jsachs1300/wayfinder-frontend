'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { adminFetch } from '@/lib/adminApi'
import { clearSession, getSession, setSession, subscribeSession } from '@/lib/sessionStore'

type AdminSession = {
  token: string
  isAdmin: boolean
  expiresAt?: string
}

type AdminSessionContextValue = {
  session: AdminSession | null
  isLoading: boolean
  error: string | null
  signOut: () => Promise<void>
}

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null)

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSessionState(getSession())
    const unsubscribe = subscribeSession(setSessionState)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!session?.token) return

    const validate = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await adminFetch<{ session?: { is_admin?: boolean; expires_at?: string } }>(
          '/api/sessions/validate',
          { sessionToken: session.token }
        )

        if (!data.session?.is_admin) {
          clearSession()
          setError('Admin session is not active. Please re-elevate from the console.')
          return
        }

        setSession({
          token: session.token,
          isAdmin: true,
          expiresAt: data.session?.expires_at,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to validate admin session.')
        clearSession()
      } finally {
        setIsLoading(false)
      }
    }

    validate()
  }, [session?.token])

  const signOut = useCallback(async () => {
    if (!session) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await adminFetch('/api/sessions/logout', {
        method: 'POST',
        sessionToken: session.token,
      })
    } catch {
      // Ignore logout errors; clear local state anyway.
    } finally {
      clearSession()
      setIsLoading(false)
    }
  }, [session])

  const value = useMemo(
    () => ({ session, isLoading, error, signOut }),
    [session, isLoading, error, signOut]
  )

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext)
  if (!context) {
    throw new Error('useAdminSession must be used within AdminSessionProvider')
  }
  return context
}
