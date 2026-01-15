import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from 'redis'

export const runtime = 'nodejs'

const signupSchema = z.object({
  email: z.string().email(),
  company: z.string().optional(),
  role: z.string().optional(),
  source: z.string().optional(),
  referrer: z.string().optional(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
})

const redisUrl = process.env.REDIS_URL

type RedisClient = ReturnType<typeof createClient>

const globalForRedis = globalThis as typeof globalThis & {
  redisClient?: RedisClient
}

const redisClient = globalForRedis.redisClient ?? (redisUrl ? createClient({ url: redisUrl }) : null)

if (!globalForRedis.redisClient) {
  globalForRedis.redisClient = redisClient ?? undefined
}

async function getRedis() {
  if (!redisUrl || !redisClient) {
    throw new Error('REDIS_URL is not set')
  }
  if (!redisClient.isOpen) {
    await redisClient.connect()
  }
  return redisClient
}

export async function POST(request: NextRequest) {
  let body: unknown = null

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  let redis: RedisClient
  try {
    redis = await getRedis()
  } catch {
    return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })
  }

  const key = `signup:email:${email}`

  const exists = await redis.exists(key)
  if (exists) {
    const existingId = await redis.hGet(key, 'id')
    return NextResponse.json({
      ok: true,
      id: existingId || null,
      email,
      status: 'already_subscribed',
    })
  }

  const id = `signup_${crypto.randomUUID()}`
  const createdAt = new Date().toISOString()

  const fields: Record<string, string> = {
    id,
    email,
    source: parsed.data.source ?? 'landing',
    created_at: createdAt,
  }

  if (parsed.data.company) {
    fields.company = parsed.data.company
  }
  if (parsed.data.role) {
    fields.role = parsed.data.role
  }
  if (parsed.data.referrer) {
    fields.referrer = parsed.data.referrer
  }
  if (parsed.data.utm?.source) fields.utm_source = parsed.data.utm.source
  if (parsed.data.utm?.medium) fields.utm_medium = parsed.data.utm.medium
  if (parsed.data.utm?.campaign) fields.utm_campaign = parsed.data.utm.campaign
  if (parsed.data.utm?.term) fields.utm_term = parsed.data.utm.term
  if (parsed.data.utm?.content) fields.utm_content = parsed.data.utm.content

  await redis.hSet(key, fields)
  await redis.sAdd('signup:all', email)
  await redis.sAdd(`signup:by_day:${createdAt.slice(0, 10)}`, email)

  return NextResponse.json(
    {
      ok: true,
      id,
      email,
      status: 'queued',
    },
    { status: 201 }
  )
}
