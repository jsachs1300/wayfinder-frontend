'use client'

import { Container } from './Container'
import { Button } from '../ui/Button'
import { Moon, Sun, Compass } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Wayfinder
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/#features"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
            >
              Features
            </Link>
            <Link
              href="/#use-cases"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
            >
              Use Cases
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
            >
              How it works
            </Link>
            <Link
              href="/api-reference"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
            >
              API Reference
            </Link>
            <Button variant="primary" size="sm" onClick={() => router.push('/console?login=1')}>
              Get started
            </Button>
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            )}
          </nav>
        </div>
      </Container>
    </header>
  )
}
