"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getProjectsLookup } from "@/services/project-service"
import type { ProjectLookupItem, PinnedProjectLookupItem } from "@/types/project"

export interface UseProjectLookupResult {
  pinned: PinnedProjectLookupItem[]
  items: ProjectLookupItem[]
  totalCount: number
  hasNextPage: boolean
  loading: boolean
  loadMore: () => void
}

/**
 * Reusable hook for fetching a lightweight paginated project list.
 * Debounces `query` by 300ms. Respects `enabled` to avoid fetching when hidden.
 * Exposes `pinned` (page 1 only) and `items` separately so callers can render them differently.
 * Call `loadMore()` to append the next page.
 */
export function useProjectLookup(query: string, enabled: boolean): UseProjectLookupResult {
  const [pinned, setPinned] = useState<PinnedProjectLookupItem[]>([])
  const [items, setItems] = useState<ProjectLookupItem[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loading, setLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  // Track current query for loadMore calls (avoids stale closure)
  const queryRef = useRef(query)
  // eslint-disable-next-line react-hooks/refs -- intentional: stable ref for callback closure
  queryRef.current = query

  const fetchPage = useCallback((search: string, pg: number) => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)

    getProjectsLookup({ search: search || undefined, page: pg, pageSize: 20, signal: ctrl.signal })
      .then((res) => {
        if (ctrl.signal.aborted) return
        if (pg === 1) {
          setPinned(res.pinned ?? [])
          setItems(res.items ?? [])
        } else {
          setItems((prev) => [...prev, ...(res.items ?? [])])
        }
        setTotalCount(res.totalCount)
        setHasNextPage(res.hasNextPage)
      })
      .catch(() => {})
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false)
      })
  }, [])

  // Reset and fetch when query or enabled changes
  useEffect(() => {
    if (!enabled) {
      if (abortRef.current) abortRef.current.abort()
      setPinned([])
      setItems([])
      setPage(1)
      setTotalCount(0)
      setHasNextPage(false)
      return
    }

    setPage(1)
    const delay = query ? 300 : 0
    const timer = setTimeout(() => fetchPage(query, 1), delay)
    return () => clearTimeout(timer)
  }, [query, enabled, fetchPage])

  const loadMore = useCallback(() => {
    if (!hasNextPage || loading) return
    const next = page + 1
    setPage(next)
    fetchPage(queryRef.current, next)
  }, [hasNextPage, loading, page, fetchPage])

  return { pinned, items, totalCount, hasNextPage, loading, loadMore }
}
