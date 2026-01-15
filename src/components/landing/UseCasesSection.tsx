import { Container } from '../layout/Container'
import { Building2, Workflow, ShieldCheck } from 'lucide-react'

const useCases = [
  {
    icon: Building2,
    title: 'Multi-Tenant SaaS Platforms',
    description:
      'Enforce per-customer policies to control which models each tenant can access. Manage costs by tier and maintain compliance with enterprise requirements.',
    features: [
      'Customer-specific model access',
      'Usage tracking and billing',
      'Isolated policy boundaries',
    ],
  },
  {
    icon: Workflow,
    title: 'AI Aggregators & Platforms',
    description:
      'Optimize cost and latency trade-offs by routing requests to the best model for each task. Build collective intelligence from user feedback.',
    features: [
      'Cost optimization',
      'Latency-aware routing',
      'A/B testing capabilities',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Applications',
    description:
      'Meet compliance and governance requirements with fine-grained access controls. Maintain audit trails and enforce security policies across your organization.',
    features: [
      'Compliance enforcement',
      'Audit logging',
      'Security policy management',
    ],
  },
]

export function UseCasesSection() {
  return (
    <section id="use-cases" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <Container>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-h1 font-bold text-gray-900 dark:text-white mb-4">
            Built for diverse use cases
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From multi-tenant platforms to enterprise applications, Wayfinder
            adapts to your specific routing needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-8"
            >
              <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-accent-100 dark:bg-accent-900/30 p-3 text-accent-600 dark:text-accent-400">
                <useCase.icon className="h-8 w-8" />
              </div>
              <h3 className="text-h3 font-semibold text-gray-900 dark:text-white mb-3">
                {useCase.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {useCase.description}
              </p>
              <ul className="space-y-2">
                {useCase.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                  >
                    <svg
                      className="mr-2 h-4 w-4 text-accent-600 dark:text-accent-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
