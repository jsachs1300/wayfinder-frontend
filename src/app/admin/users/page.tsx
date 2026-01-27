'use client'

import { useEffect, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminSession } from '@/components/admin/AdminSessionProvider'
import { adminFetch } from '@/lib/adminApi'

type AdminUser = {
  id?: string
  email: string
  tier?: string | null
  status?: string | null
  created_at?: string | null
  token_count?: number | null
}

type AdminUsersResponse = { users: AdminUser[]; count?: number }

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(parsed)
}

export default function AdminUsersPage() {
  const { session } = useAdminSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.token) return

    const load = async () => {
      try {
        const data = await adminFetch<AdminUsersResponse>('/admin/users', {
          sessionToken: session.token,
        })
        setUsers(data.users || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load users.')
      }
    }

    load()
  }, [session?.token])

  return (
    <div>
      <AdminPageHeader
        title="Admin Users"
        description="Review user tiers, status, and token allocation across the platform."
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-gray-950 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Token Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
            {users.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  No users returned.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id || user.email}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.email}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-gray-300">{user.tier || '—'}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-gray-300">{user.status || '—'}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-gray-300">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-gray-300">{user.token_count ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
