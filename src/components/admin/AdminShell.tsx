'use client'

import { usePathname } from 'next/navigation'
import { AdminSessionProvider, useAdminSession } from './AdminSessionProvider'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'
import { AdminSignIn } from './AdminSignIn'

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { session } = useAdminSession()
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (!isAdminRoute) {
    return <>{children}</>
  }

  if (!session?.isAdmin) {
    return <AdminSignIn />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <AdminTopbar />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-10 pt-6 md:px-6">
        <AdminSidebar />
        <main className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminSessionProvider>
  )
}
