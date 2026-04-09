"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getPartners } from "@/services/partner-service"
import { globalSearch } from "@/services/search-service"
import { useProjectLookup } from "@/hooks/use-project-lookup"
import { usePaymentMethodLookup } from "@/hooks/use-payment-method-lookup"
import type { PartnerResponse } from "@/types/partner"
import type { GlobalSearchResponse } from "@/services/search-service"

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const [partners, setPartners] = useState<PartnerResponse[]>([])
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse | null>(null)

  const [loadingPartners, setLoadingPartners] = useState(false)

  const partnerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const partnerAbortRef = useRef<AbortController | null>(null)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)

  // Lookup hooks — only fetch while palette is open
  const projectLookup = useProjectLookup(query, open)
  const paymentMethodLookup = usePaymentMethodLookup(query, open)

  // Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // Reset partner + search results when closed
  useEffect(() => {
    if (!open) {
      setQuery("")
      setPartners([])
      setSearchResults(null)
    }
  }, [open])

  // Debounced partner search
  const searchPartners = useCallback((q: string) => {
    if (partnerAbortRef.current) partnerAbortRef.current.abort()

    if (!q.trim()) {
      setPartners([])
      setLoadingPartners(false)
      return
    }

    setLoadingPartners(true)
    const ctrl = new AbortController()
    partnerAbortRef.current = ctrl

    getPartners({ search: q, pageSize: 5 })
      .then((res) => {
        if (!ctrl.signal.aborted) setPartners(res.items ?? [])
      })
      .catch(() => {})
      .finally(() => {
        if (!ctrl.signal.aborted) setLoadingPartners(false)
      })
  }, [])

  useEffect(() => {
    if (!open) return
    if (partnerDebounceRef.current) clearTimeout(partnerDebounceRef.current)
    partnerDebounceRef.current = setTimeout(() => searchPartners(query), 300)
    return () => {
      if (partnerDebounceRef.current) clearTimeout(partnerDebounceRef.current)
    }
  }, [query, open, searchPartners])

  // Debounced global search (expenses + incomes) — min 2 chars
  useEffect(() => {
    if (!open) return
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

    if (query.trim().length < 2) {
      setSearchResults(null)
      return
    }

    searchDebounceRef.current = setTimeout(async () => {
      if (searchAbortRef.current) searchAbortRef.current.abort()
      const ctrl = new AbortController()
      searchAbortRef.current = ctrl

      try {
        const result = await globalSearch(query.trim())
        if (!ctrl.signal.aborted) setSearchResults(result)
      } catch {
        // ignore
      }
    }, 300)

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [query, open])

  return {
    open,
    setOpen,
    query,
    setQuery,
    // Projects
    pinnedProjects: projectLookup.pinned,
    projects: projectLookup.items,
    projectsHasNextPage: projectLookup.hasNextPage,
    projectsLoadMore: projectLookup.loadMore,
    loadingProjects: projectLookup.loading,
    // Payment methods
    paymentMethods: paymentMethodLookup.items,
    paymentMethodsHasNextPage: paymentMethodLookup.hasNextPage,
    paymentMethodsLoadMore: paymentMethodLookup.loadMore,
    // Partners (server-side debounced search)
    partners,
    loadingPartners,
    // Global search
    searchResults,
  }
}
