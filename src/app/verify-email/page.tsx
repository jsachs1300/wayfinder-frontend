'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailRedirectPage() {
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    const target = token ? `/verify?token=${encodeURIComponent(token)}` : '/verify'
    window.location.replace(target)
  }, [params])

  return null
}
