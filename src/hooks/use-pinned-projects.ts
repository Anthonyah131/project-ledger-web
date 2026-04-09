"use client"

import { useState, useCallback } from "react"

const STORAGE_KEY = "pl:pinned_projects"
const MAX_PINNED = 6

function readFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

export function usePinnedProjects() {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(readFromStorage)

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size >= MAX_PINNED) return prev
        next.add(id)
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {}
      return next
    })
  }, [])

  return { pinnedIds, togglePin }
}
