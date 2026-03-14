"use client"

import { PiggyBank } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface BudgetEmptyStateProps {
  canManage: boolean
  onSet: () => void
}

export function BudgetEmptyState({ canManage, onSet }: BudgetEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-card shadow-sm shadow-violet-500/5 px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-violet-500/15 via-purple-500/8 to-transparent" />
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-sm shadow-violet-500/20">
          <PiggyBank className="size-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Sin presupuesto configurado</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-70 leading-relaxed">
            Define un presupuesto para controlar cuánto llevas gastado en este proyecto.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={onSet}
            size="sm"
            className="mt-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 border-0 shadow-sm shadow-violet-500/30"
          >
            Configurar presupuesto
          </Button>
        )}
        {!canManage && (
          <p className="text-[11px] text-muted-foreground">
            Solo propietarios y editores pueden configurar el presupuesto.
          </p>
        )}
      </div>
    </div>
  )
}

export function BudgetSkeleton() {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 via-card to-card">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="h-8 w-28" />
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-border p-3.5 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>

        <div className="rounded-xl border border-border p-3.5 space-y-2">
          <Skeleton className="h-3 w-80" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
    </div>
  )
}
