import { Container } from '../layout/Container'
import { Shield, Network, Zap, Database } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Policy Enforcement',
    description:
      'Token-scoped rules and global policies ensure only approved models are selected. Maintain compliance and control costs with fine-grained access controls.',
  },
  {
    icon: Network,
    title: 'Intelligent Routing',
    description:
      'AI-powered routing engine evaluates model capabilities and returns primary and alternate recommendations with confidence scores based on learned patterns.',
  },
  {
    icon: Zap,
    title: 'Semantic Caching',
    description:
      'Reduce API costs by 40-70% with Redis-powered semantic caching that matches similar queries. Fast responses for recurring patterns without sacrificing quality.',
  },
  {
    icon: Database,
    title: 'Knowledge Store',
    description:
      'Collective feedback builds consensus about model performance per intent cluster. Routing decisions improve over time with user feedback.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <Container>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-h1 font-bold text-gray-900 dark:text-white mb-4">
            Everything you need for LLM routing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Wayfinder provides a complete solution for intelligent model selection,
            cost optimization, and policy enforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 transition-all duration-300 hover:shadow-xl hover:border-brand-500/50 dark:hover:border-brand-500/50"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30 p-3 text-brand-600 dark:text-brand-400">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-h3 font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
