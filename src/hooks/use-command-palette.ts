"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { getProjects } from "@/services/project-service"
import { getPartners } from "@/services/partner-service"
import { getPaymentMethods } from "@/services/payment-method-service"
import { globalSearch } from "@/services/search-service"
import type { ProjectResponse } from "@/types/project"
import type { PartnerResponse } from "@/types/partner"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { GlobalSearchResponse } from "@/services/search-service"

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [partners, setPartners] = useState<PartnerResponse[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([])
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse | null>(null)

  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingPartners, setLoadingPartners] = useState(false)

  const partnerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const partnerAbortRef = useRef<AbortController | null>(null)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)

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

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setQuery("")
      setPartners([])
      setSearchResults(null)
    }
  }, [open])

  // Load projects + payment methods once when palette opens
  useEffect(() => {
    if (!open) return

    setLoadingProjects(true)
    getProjects({ pageSize: 200, sortBy: "name", sortDirection: "asc" })
      .then((res) => setProjects(res.items ?? []))
      .catch(() => {})
      .finally(() => setLoadingProjects(false))

    getPaymentMethods()
      .then((res) => setPaymentMethods(res))
      .catch(() => {})
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

  // Filter projects client-side
  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? projects.filter((p) => p.name.toLowerCase().includes(q))
      : projects
    return list.slice(0, 5)
  }, [projects, query])

  // Filter payment methods client-side
  const filteredPaymentMethods = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? paymentMethods.filter((pm) => pm.name.toLowerCase().includes(q))
      : paymentMethods
    return list.slice(0, 4)
  }, [paymentMethods, query])

  return {
    open,
    setOpen,
    query,
    setQuery,
    filteredProjects,
    partners,
    filteredPaymentMethods,
    searchResults,
    loadingProjects,
    loadingPartners,
  }
}
