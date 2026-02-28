"use client"

import { useState, useEffect, useRef } from "react"

/**
 * Returns a debounced version of `value` that only updates
 * after `delay` ms of inactivity.
 *
 * Also calls `onUpdate` (if provided) each time the debounced
 * value changes — useful for resetting pagination.
 */
export function useDebouncedValue<T>(
  value: T,
  delay = 300,
  onUpdate?: () => void,
): T {
  const [debounced, setDebounced] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip the callback on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setDebounced(value)
      onUpdate?.()
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, delay, onUpdate])

  return debounced
}
