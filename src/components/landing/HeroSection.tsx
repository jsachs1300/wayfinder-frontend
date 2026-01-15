'use client'

import { Container } from '../layout/Container'
import { Button } from '../ui/Button'
import { AnimatedAPIDemo } from './AnimatedAPIDemo'
import { ArrowRight } from 'lucide-react'

const scrollToId = (id: string) => {
  const target = document.getElementById(id)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

      <Container className="relative">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-hero font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Intelligent LLM
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              Routing Control Plane
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Optimize model selection with policy enforcement, learned routing decisions,
            and semantic caching. Reduce costs while maintaining quality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group" onClick={() => scrollToId('signup')}>
              Notify me
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => scrollToId('how-it-works')}>
              How it works
            </Button>
          </div>
        </div>

        <AnimatedAPIDemo />
      </Container>
    </section>
  )
}
