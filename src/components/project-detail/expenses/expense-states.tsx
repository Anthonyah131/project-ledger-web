"use client"

import { FolderOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  hasSearch: boolean
  onCreate: () => void
}

export function ExpensesEmptyState({ hasSearch, onCreate }: EmptyStateProps) {
  return (
    <EmptyState
      hasSearch={hasSearch}
      onCreate={onCreate}
      icon={FolderOpen}
      title="Sin gastos registrados"
      description="Registra el primer gasto del proyecto."
      searchDescription="No se encontraron gastos con ese criterio."
      createLabel="Nuevo gasto"
    />
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ExpensesSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-2.5 border-b border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent">
        <Skeleton className="h-3 w-64" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center px-5 py-3.5 border-b border-border last:border-b-0"
        >
          <Skeleton className="size-2 rounded-full mr-3.5" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24 mt-1.5" />
          </div>
          <Skeleton className="h-3 w-20 hidden sm:block" />
          <Skeleton className="h-4 w-24 ml-4 hidden md:block" />
          <Skeleton className="h-3 w-28 ml-4 hidden lg:block" />
        </div>
      ))}
    </div>
  )
}
