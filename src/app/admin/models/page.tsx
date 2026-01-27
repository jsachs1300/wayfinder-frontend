'use client'

import { useEffect, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAdminSession } from '@/components/admin/AdminSessionProvider'
import { adminFetch } from '@/lib/adminApi'

type ModelRecord = { id: string; provider?: string; status?: string }

type ModelsResponse = { models: ModelRecord[]; count?: number; default?: string }

export default function AdminModelsPage() {
  const { session } = useAdminSession()
  const [models, setModels] = useState<ModelRecord[]>([])
  const [defaultModel, setDefaultModel] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.token) return

    const load = async () => {
      try {
        const data = await adminFetch<ModelsResponse>('/admin/models', {
          sessionToken: session.token,
        })
        setModels(data.models || [])
        setDefaultModel(data.default || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load models.')
      }
    }

    load()
  }, [session?.token])

  return (
    <div>
      <AdminPageHeader
        title="Admin Models"
        description="Inspect the model catalog, provider status, and default routing targets."
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {defaultModel && (
          <p className="text-sm text-slate-500">
            Default model: <span className="font-semibold text-gray-900 dark:text-white">{defaultModel}</span>
          </p>
        )}

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-gray-950 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Model ID</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {models.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={3}>
                    No models returned.
                  </td>
                </tr>
              )}
              {models.map((model) => (
                <tr key={model.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{model.id}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-gray-300">{model.provider || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-gray-300">{model.status || 'active'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
