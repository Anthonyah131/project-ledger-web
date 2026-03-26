"use client"

import { CreditCard } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState as GenericEmptyState } from "@/components/shared/empty-state"
import { useLanguage } from "@/context/language-context"

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  hasSearch: boolean
  onCreate: () => void
}

export function EmptyState({ hasSearch, onCreate }: EmptyStateProps) {
  const { t } = useLanguage()
  return (
    <GenericEmptyState
      hasSearch={hasSearch}
      onCreate={onCreate}
      icon={CreditCard}
      title={t("paymentMethods.emptyTitle")}
      description={t("paymentMethods.emptyDesc")}
      searchDescription={t("paymentMethods.emptySearch")}
      createLabel={t("paymentMethods.emptyCreateLabel")}
    />
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function PaymentMethodsShelfSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-cyan-500/10">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card p-5">
          <div className="flex gap-4">
            <Skeleton className="w-1.5 h-20 rounded-full" />
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44 mt-2" />
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-20 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PaymentMethodsSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-2.5 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent">
        <Skeleton className="h-3 w-64" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center px-5 py-3.5 border-b border-border last:border-b-0"
        >
          <Skeleton className="size-2 rounded-full shrink-0 mr-3.5" />
          <div className="flex-1 min-w-0 mr-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48 mt-1.5" />
          </div>
          <Skeleton className="w-12 h-4 rounded-full hidden sm:block" />
          <Skeleton className="w-10 h-3 hidden sm:block ml-4" />
          <Skeleton className="w-28 h-3 hidden md:block ml-4" />
          <Skeleton className="w-20 h-3 hidden lg:block ml-4" />
        </div>
      ))}
    </div>
  )
}
