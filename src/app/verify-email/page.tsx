import { redirect } from 'next/navigation'

type SearchParams = Record<string, string | string[] | undefined>

export default async function VerifyEmailRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const resolved = searchParams ? await searchParams : undefined
  const rawToken = resolved?.token
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken
  const target = token ? `/verify?token=${encodeURIComponent(token)}` : '/verify'
  redirect(target)
}
