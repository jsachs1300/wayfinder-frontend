export function AdminPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400">
        Admin Console
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
          {description}
        </p>
      )}
    </div>
  )
}
