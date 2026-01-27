'use client'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export default function AdminSettingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Admin Settings"
        description="Configure admin preferences and session policies."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-slate-600 dark:text-gray-300">
          Settings configuration is not yet available. This page is ready for future controls
          like session duration, audit logging, and admin alerts.
        </p>
      </div>
    </div>
  )
}
