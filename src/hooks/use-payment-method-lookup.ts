"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getPaymentMethodsLookup } from "@/services/payment-method-service"
import type { PaymentMethodLookupItem } from "@/types/payment-method"

export interface UsePaymentMethodLookupResult {
  items: PaymentMethodLookupItem[]
  totalCount: number
  hasNextPage: boolean
  loading: boolean
  loadMore: () => void
}

/**
 * Reusable hook for fetching a lightweight paginated payment method list.
 * Debounces `query` by 300ms. Respects `enabled` to avoid fetching when hidden.
 * Call `loadMore()` to append the next page.
 */
export function usePaymentMethodLookup(query: string, enabled: boolean): UsePaymentMethodLookupResult {
  const [items, setItems] = useState<PaymentMethodLookupItem[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loading, setLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const queryRef = useRef(query)
  // eslint-disable-next-line react-hooks/refs -- intentional: stable ref for callback closure
  queryRef.current = query

  const fetchPage = useCallback((search: string, pg: number) => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setLoading(true)

    getPaymentMethodsLookup({ search: search || undefined, page: pg, pageSize: 20, signal: ctrl.signal })
      .then((res) => {
        if (ctrl.signal.aborted) return
        if (pg === 1) {
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

  useEffect(() => {
    if (!enabled) {
      if (abortRef.current) abortRef.current.abort()
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

  return { items, totalCount, hasNextPage, loading, loadMore }
}
