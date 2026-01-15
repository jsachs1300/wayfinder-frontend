'use client'

import { Container } from '../layout/Container'
import { Button } from '../ui/Button'
import { ArrowRight } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'

type SignupStatus = 'idle' | 'loading' | 'success' | 'error'

export function CTASection() {
  const [status, setStatus] = useState<SignupStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')

  const isDisabled = status === 'loading' || status === 'success'

  const utm = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }
    const params = new URLSearchParams(window.location.search)
    const value = (key: string) => params.get(key) || undefined
    const data = {
      source: value('utm_source'),
      medium: value('utm_medium'),
      campaign: value('utm_campaign'),
      term: value('utm_term'),
      content: value('utm_content'),
    }
    const hasUtm = Object.values(data).some(Boolean)
    return hasUtm ? data : null
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setStatus('loading')

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        source: 'landing',
        referrer: typeof document === 'undefined' ? undefined : document.referrer || window.location.href,
        utm: utm || undefined,
      }

      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))
      if (response.ok && data.ok) {
        setStatus('success')
        return
      }

      const error = data.error || 'unknown_error'
      const message = error === 'invalid_email'
        ? 'Please enter a valid email address.'
        : error === 'rate_limited'
          ? 'Please try again in a minute.'
          : 'Something went wrong. Please try again.'

      setErrorMessage(message)
      setStatus('error')
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section
      id="signup"
      className="py-16 md:py-24 bg-gradient-to-br from-brand-600 to-accent-600 dark:from-brand-700 dark:to-accent-700"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-h1 font-bold text-white mb-4">
              Get early access to Wayfinder
            </h2>
          <p className="text-xl text-brand-50 max-w-2xl mb-6">
            Join the waitlist for the fully managed Wayfinder service. We will
            share launch updates, hosted endpoint access, and API reference previews.
          </p>
          <p className="text-sm text-brand-50">
            Questions?{' '}
            <a className="underline underline-offset-4" href="mailto:info@wyfndr.ai">
              info@wyfndr.ai
            </a>
          </p>
          <div className="flex items-center gap-2 text-brand-50 text-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-white/70" />
            No spam. We only email you about launch and access updates.
          </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notify me when it launches
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signup-email">
                  Work email
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isDisabled}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="you@company.com"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signup-company">
                    Company (optional)
                  </label>
                  <input
                    id="signup-company"
                    name="company"
                    type="text"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    disabled={isDisabled}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Wayfinder"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signup-role">
                    Role (optional)
                  </label>
                  <input
                    id="signup-role"
                    name="role"
                    type="text"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    disabled={isDisabled}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="CTO"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full group"
                disabled={isDisabled}
              >
                {status === 'success' ? 'You are on the list' : 'Join waitlist'}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>

              {status === 'success' && (
                <p className="text-sm text-green-700" aria-live="polite">
                  Thanks! We will be in touch with early access details.
                </p>
              )}

              {status === 'error' && (
                <p className="text-sm text-red-600" aria-live="polite">
                  {errorMessage}
                </p>
              )}
            </div>
          </form>
        </div>
      </Container>
    </section>
  )
}
