import { Container } from './Container'
import { Compass } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <Container>
        <div className="py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Wayfinder
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                Intelligent LLM routing control plane that optimizes model
                selection based on policy constraints and learned patterns.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Contact:{' '}
                <a className="hover:text-brand-600 dark:hover:text-brand-400" href="mailto:info@wyfndr.ai">
                  info@wyfndr.ai
                </a>
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Product
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="/api-reference" className="hover:text-brand-600 dark:hover:text-brand-400">
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Company
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#signup" className="hover:text-brand-600 dark:hover:text-brand-400">
                    Join waitlist
                  </a>
                </li>
                <li>
                  <a href="#use-cases" className="hover:text-brand-600 dark:hover:text-brand-400">
                    Use cases
                  </a>
                </li>
                <li>
                  <a href="https://github.com/jsachs1300/wayfinder" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 dark:hover:text-brand-400">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Wayfinder. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
