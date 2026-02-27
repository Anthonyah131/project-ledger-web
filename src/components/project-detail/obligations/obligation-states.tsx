"use client"

import { Receipt, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface EmptyProps {
  hasFilter: boolean
  onCreate: () => void
}

export function ObligationsEmptyState({ hasFilter, onCreate }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {hasFilter ? (
        <SearchX className="size-10 text-muted-foreground/50 mb-3" />
      ) : (
        <Receipt className="size-10 text-muted-foreground/50 mb-3" />
      )}
      <p className="text-sm font-medium text-foreground mb-1">
        {hasFilter ? "Sin resultados" : "Sin obligaciones registradas"}
      </p>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs">
        {hasFilter
          ? "No hay obligaciones que coincidan con el filtro seleccionado."
          : "Registra obligaciones financieras para llevar control de pagos."}
      </p>
      {!hasFilter && (
        <Button size="sm" onClick={onCreate}>
          Nueva obligación
        </Button>
      )}
    </div>
  )
}

export function ObligationsSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-6 gap-4 px-5 py-2 bg-muted/30">
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
