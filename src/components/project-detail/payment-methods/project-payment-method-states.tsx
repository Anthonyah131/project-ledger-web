"use client"

import { CreditCard } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  isOwner: boolean
  onLink: () => void
}

export function ProjectPaymentMethodsEmptyState({ isOwner, onLink }: EmptyStateProps) {
  return (
    <EmptyState
      hasSearch={false}
      onCreate={onLink}
      icon={CreditCard}
      title="Sin métodos de pago vinculados"
      description={
        isOwner
          ? "Vincula un método de pago para que pueda usarse en los gastos del proyecto."
          : "El propietario del proyecto aún no ha vinculado métodos de pago."
      }
      searchDescription=""
      createLabel={isOwner ? "Vincular método" : undefined}
    />
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ProjectPaymentMethodsSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-2.5 border-b border-border bg-muted/30">
        <Skeleton className="h-3 w-64" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center px-5 py-3.5 border-b border-border last:border-b-0"
        >
          <div className="flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24 mt-1.5" />
          </div>
          <Skeleton className="h-3 w-16 hidden sm:block" />
          <Skeleton className="h-4 w-12 ml-4 hidden md:block" />
          <Skeleton className="h-3 w-28 ml-4 hidden lg:block" />
        </div>
      ))}
    </div>
  )
}
