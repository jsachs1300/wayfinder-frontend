'use client'

import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CodeBlock } from '../ui/CodeBlock'
import { useTypingEffect } from '@/hooks/useTypingEffect'
import { useCycleScenarios } from '@/hooks/useCycleScenarios'
import { scenarios } from '@/lib/scenarios'

export function AnimatedAPIDemo() {
  const { currentScenario, currentIndex, setScenarioIndex } = useCycleScenarios(scenarios, 12000)

  const curlCommand = useMemo(() => {
    const bodyJson = JSON.stringify(currentScenario.request.body)
    return `curl -X ${currentScenario.request.method} https://wyfndr.ai${currentScenario.request.endpoint} \\\n     -d '${bodyJson}'`
  }, [currentScenario])

  const responseText = useMemo(() => JSON.stringify(currentScenario.response, null, 2), [currentScenario])

  const fullText = useMemo(() => `${curlCommand}\n${responseText}`, [curlCommand, responseText])

  const { displayText: typedText, isComplete: typingComplete } =
    useTypingEffect({
      text: fullText,
      speed: 15,
    })

  useEffect(() => {
    // Scrolls typing animation back to the top for shorter scenarios
    const codeBlock = document.querySelector('[data-code-block="demo"]')
    if (codeBlock instanceof HTMLElement) {
      codeBlock.scrollTop = 0
    }
  }, [currentIndex])

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Scenario indicators */}
      <div className="flex justify-center gap-2 mb-6">
        {scenarios.map((scenario, index) => (
          <button
            key={scenario.id}
            type="button"
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-brand-600'
                : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
            }`}
            aria-label={`Scenario ${index + 1}: ${scenario.title}`}
            aria-pressed={index === currentIndex}
            onClick={() => setScenarioIndex(index)}
          />
        ))}
      </div>

      {/* Scenario title and description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {currentScenario.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {currentScenario.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* API Demo */}
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            API Request & Response
          </span>
          {typingComplete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
              200 OK
            </motion.span>
          )}
        </div>
        <div className="bg-[#1d1f21] p-4 min-h-[400px]" data-code-block="demo">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CodeBlock
                code={typedText}
                language="bash"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Highlight text */}
      <AnimatePresence>
        {typingComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Key fields:{' '}
              {currentScenario.highlightFields.map((field, i) => (
                <span key={field}>
                  <code className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded text-xs font-mono">
                    {field}
                  </code>
                  {i < currentScenario.highlightFields.length - 1 && ', '}
                </span>
              ))}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
