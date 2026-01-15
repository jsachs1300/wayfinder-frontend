import { Container } from '../layout/Container'
import { Button } from '../ui/Button'
import { Compass, Layers, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    title: 'Route',
    description:
      'Send your prompt to Wayfinder. The router evaluates intent, policy rules, and model capabilities.',
  },
  {
    title: 'Decide',
    description:
      'Wayfinder returns a primary model plus alternates with confidence scores and reasoning.',
  },
  {
    title: 'Improve',
    description:
      'Feedback and caching continuously refine routing decisions and reduce latency over time.',
  },
]

const outcomes = [
  'Policy enforcement by tenant, team, or token.',
  'Cost-aware routing with transparency on why a model was chosen.',
  'Semantic caching to reuse high-quality answers.',
  'A single API for multi-provider model access.',
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <Container>
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400 mb-3">
            How it works
          </p>
          <h2 className="text-h1 font-bold text-gray-900 dark:text-white mb-4">
            A managed routing layer for production LLMs
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connect your application once. Wayfinder handles model selection, policies,
            caching, and observability so you can ship faster.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <span className="text-lg font-semibold">{index + 1}</span>
              </div>
              <h3 className="text-h3 font-semibold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-h3 font-semibold text-gray-900 dark:text-white mb-3">
              What you get
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              {outcomes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-h3 font-semibold text-gray-900 dark:text-white mb-3">
              Usage overview
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Route prompts through a single endpoint, pass optional policy context,
              and receive transparent, scored decisions you can log or display.
            </p>
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Example: POST /v1/routing with prompt + tenant policy metadata.
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-h3 font-semibold text-gray-900 dark:text-white mb-3">
              API Reference
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Explore the public endpoints for routing, feedback, and token management.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/api-reference">
                <Button size="sm" variant="secondary" className="group">
                  View reference
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
