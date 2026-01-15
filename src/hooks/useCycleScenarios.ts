'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Scenario } from '@/types/scenarios'

export function useCycleScenarios(
  scenarios: Scenario[],
  intervalMs = 8000,
  pauseAfterInteractionMs = 15000
) {
  const scenarioCount = scenarios.length
  if (scenarioCount === 0) {
    throw new Error('useCycleScenarios requires at least one scenario')
  }

  const [currentIndex, setCurrentIndex] = useState(0)
  const lastManualRef = useRef<number | null>(null)
  const currentScenario = scenarios[currentIndex]!

  const setIndex = useCallback(
    (index: number) => {
      const nextIndex = ((index % scenarioCount) + scenarioCount) % scenarioCount
      setCurrentIndex(nextIndex)
    },
    [scenarioCount]
  )

  const setScenarioIndex = useCallback(
    (index: number) => {
      lastManualRef.current = Date.now()
      setIndex(index)
    },
    [setIndex]
  )

  useEffect(() => {
    const now = Date.now()
    const lastManual = lastManualRef.current
    const pauseRemaining = lastManual
      ? Math.max(pauseAfterInteractionMs - (now - lastManual), 0)
      : 0
    const delay = pauseAfterInteractionMs > 0 ? Math.max(intervalMs, pauseRemaining) : intervalMs

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % scenarioCount)
    }, delay)

    return () => clearTimeout(timeout)
  }, [currentIndex, intervalMs, pauseAfterInteractionMs, scenarioCount])

  return { currentScenario, currentIndex, setScenarioIndex }
}
