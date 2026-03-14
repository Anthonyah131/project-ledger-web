"use client"

import { Receipt } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"

interface EmptyProps {
  hasFilter: boolean
  onCreate: () => void
}

export function ObligationsEmptyState({ hasFilter, onCreate }: EmptyProps) {
  return (
    <EmptyState
      hasSearch={hasFilter}
      onCreate={onCreate}
      icon={Receipt}
      title="Sin obligaciones registradas"
      description="Registra obligaciones financieras para llevar control de pagos."
      searchDescription="No hay obligaciones que coincidan con el filtro seleccionado."
      createLabel="Nueva obligación"
    />
  )
}

export function ObligationsSkeleton() {
  return (
    <div className="rounded-xl border border-violet-500/20 bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-6 gap-4 px-5 py-2.5 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent border-b border-violet-500/20">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
        <span />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-6 items-center gap-4 px-5 py-3 border-t first:border-t-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-2.5 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-20 ml-auto" />
          <div className="space-y-1">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <span />
        </div>
      ))}
    </div>
  )
}
