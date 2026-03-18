"use client"

import { ArrowLeftRight, Handshake } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"

// ─── Balance skeleton ──────────────────────────────────────────────────────────

export function BalanceCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-32" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Settlements list skeleton ─────────────────────────────────────────────────

export function SettlementsSkeleton() {
  return (
    <div className="rounded-xl border border-violet-500/20 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-2.5 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent border-b border-violet-500/20">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-border/50 last:border-b-0"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty states ──────────────────────────────────────────────────────────────

interface SettlementsEmptyStateProps {
  onCreate: () => void
}

export function SettlementsEmptyState({ onCreate }: SettlementsEmptyStateProps) {
  return (
    <EmptyState
      hasSearch={false}
      onCreate={onCreate}
      icon={ArrowLeftRight}
      title="Sin liquidaciones"
      description="Registra liquidaciones directas entre partners para saldar balances."
      createLabel="Nueva liquidación"
    />
  )
}

export function NoPartnersState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <Handshake className="size-10 text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">
        No hay partners asignados al proyecto
      </p>
      <p className="text-xs text-muted-foreground/70">
        Asigna partners desde la pestaña Configuración para ver balances y liquidaciones.
      </p>
    </div>
  )
}
