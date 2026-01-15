'use client'

import { useState, useEffect, useRef } from 'react'

interface UseTypingEffectOptions {
  text: string
  speed?: number
  onComplete?: () => void
}

export function useTypingEffect({
  text,
  speed = 30,
  onComplete
}: UseTypingEffectOptions) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)
  const frameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayText('')
    setIsComplete(false)
    lastUpdateRef.current = 0

    const animate = (timestamp: number) => {
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = timestamp
      }

      const elapsed = timestamp - lastUpdateRef.current

      if (elapsed >= speed) {
        if (indexRef.current < text.length) {
          setDisplayText(text.slice(0, indexRef.current + 1))
          indexRef.current++
          lastUpdateRef.current = timestamp
        } else if (!isComplete) {
          setIsComplete(true)
          onComplete?.()
          return
        }
      }

      if (indexRef.current < text.length || !isComplete) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [text, speed, onComplete, isComplete])

  return { displayText, isComplete }
}
