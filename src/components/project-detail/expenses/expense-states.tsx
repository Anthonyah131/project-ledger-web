"use client"

import { FolderOpen, Plus, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  hasSearch: boolean
  onCreate: () => void
}

export function ExpensesEmptyState({ hasSearch, onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="flex items-center justify-center size-12 rounded-xl bg-muted">
        {hasSearch ? (
          <SearchX className="size-5 text-muted-foreground" />
        ) : (
          <FolderOpen className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-foreground">
          {hasSearch ? "Sin resultados" : "Sin gastos registrados"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-65 leading-relaxed">
          {hasSearch
            ? "No se encontraron gastos con ese criterio."
            : "Registra el primer gasto del proyecto."}
        </p>
      </div>
      {!hasSearch && (
        <Button onClick={onCreate} size="sm" className="mt-1">
          <Plus className="size-3.5" />
          Nuevo gasto
        </Button>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ExpensesSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-2.5 border-b border-border bg-muted/30">
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
