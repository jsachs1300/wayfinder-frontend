import { Container } from '../layout/Container'
import { Button } from '../ui/Button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CTASection() {
  return (
    <section
      id="get-started"
      className="py-16 md:py-24 bg-gradient-to-br from-brand-600 to-accent-600 dark:from-brand-700 dark:to-accent-700"
    >
      <Container>
        <div className="rounded-2xl bg-white/10 p-8 md:p-12 backdrop-blur-sm">
          <h2 className="text-h1 font-bold text-white mb-4">
            Wayfinder is open for business
          </h2>
          <p className="text-xl text-brand-50 max-w-2xl mb-8">
            Sign in to create tokens, configure routing, and start using your model registry.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/console?login=1">
              <Button size="lg" className="group">
                Get started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/api-reference">
              <Button size="lg" variant="secondary">View API reference</Button>
            </Link>
          </div>
          <p className="text-sm text-brand-50 mt-6">
            Questions?{' '}
            <a className="underline underline-offset-4" href="mailto:info@wyfndr.ai">
              info@wyfndr.ai
            </a>
          </p>
        </div>
      </Container>
    </section>
  )
}
