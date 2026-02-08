const stripTrailingSlash = (value: string) => value.replace(/\/$/, '')

const buildRouteUrl = () => {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) return null
  let base = stripTrailingSlash(baseUrl)
  if (base.endsWith('/api')) {
    base = base.slice(0, -4)
  }
  return `${base}/route`
}

const filterRequestHeaders = (headers: Headers) => {
  const filtered = new Headers(headers)
  filtered.delete('host')
  filtered.delete('connection')
  filtered.delete('content-length')
  filtered.delete('accept-encoding')
  filtered.delete('cookie')
  filtered.delete('x-session-token')
  return filtered
}

const buildResponseHeaders = (headers: Headers) => {
  const passthrough = new Headers()
  const contentType = headers.get('content-type')
  if (contentType) passthrough.set('content-type', contentType)
  ;['ratelimit-limit', 'ratelimit-remaining', 'ratelimit-reset', 'x-request-id'].forEach(
    (key) => {
      const value = headers.get(key)
      if (value) passthrough.set(key, value)
    }
  )
  return passthrough
}

export async function POST(request: Request) {
  const target = buildRouteUrl()
  if (!target) {
    return new Response(JSON.stringify({ message: 'API_BASE_URL is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.arrayBuffer()
  const headers = filterRequestHeaders(request.headers)

  const response = await fetch(target, {
    method: 'POST',
    headers,
    body,
  })

  return new Response(response.body, {
    status: response.status,
    headers: buildResponseHeaders(response.headers),
  })
}
