export type AdminApiError = {
  error?: string
  message?: string
  timestamp?: string
}

export async function adminFetch<T>(
  input: RequestInfo,
  options: RequestInit & { sessionToken?: string; adminKey?: string } = {}
): Promise<T> {
  const { sessionToken, adminKey, headers, ...rest } = options
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const url = typeof input === 'string'
    ? `${baseUrl ? baseUrl.replace(/\/$/, '') : ''}${input.startsWith('/') ? input : `/${input}`}`
    : input
  const response = await fetch(url, {
    ...rest,
    headers: {
      ...(headers || {}),
      ...(sessionToken ? { 'X-Session-Token': sessionToken } : {}),
      ...(adminKey ? { 'X-Admin-Api-Key': adminKey } : {}),
    },
  })

  if (response.status === 204) {
    return {} as T
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = data as AdminApiError | null
    const message = error?.message || 'Request failed. Please try again.'
    throw new Error(message)
  }

  return data as T
}
