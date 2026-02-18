const stripTrailingSlash = (value: string) => value.replace(/\/$/, '')

const buildProxyUrl = (pathname: string, search: string) => {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) {
    return null
  }
  const base = stripTrailingSlash(baseUrl)
  const isApiPath = pathname.startsWith('/api/')
  const isAdminApiPath = /^\/api\/admin(?:\/|$)/.test(pathname)
  const shouldStripApiPrefix = (base.endsWith('/api') && isApiPath) || (!base.endsWith('/api') && isAdminApiPath)
  const normalizedPath = shouldStripApiPrefix ? pathname.slice(4) : pathname
  return `${base}${normalizedPath}${search}`
}

const filterHeaders = (headers: Headers) => {
  const filtered = new Headers(headers)
  filtered.delete('host')
  filtered.delete('connection')
  filtered.delete('content-length')
  filtered.delete('accept-encoding')
  return filtered
}

const proxyRequest = async (request: Request) => {
  const url = new URL(request.url)
  const target = buildProxyUrl(url.pathname, url.search)
  if (!target) {
    return new Response(JSON.stringify({ message: 'API_BASE_URL is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const method = request.method.toUpperCase()
  const headers = filterHeaders(request.headers)
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer()

  const response = await fetch(target, {
    method,
    headers,
    body,
  })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
export const OPTIONS = proxyRequest
