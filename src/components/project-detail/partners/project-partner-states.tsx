"use client"

import { Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  isOwner: boolean
  onAssign: () => void
}

export function ProjectPartnersEmptyState({ isOwner, onAssign }: EmptyStateProps) {
  return (
    <EmptyState
      hasSearch={false}
      onCreate={onAssign}
      icon={Users}
      title="Sin partners asignados"
      description={
        isOwner
          ? "Asigna un partner al proyecto para que sus cuentas estén disponibles."
          : "El propietario del proyecto aún no ha asignado partners."
      }
      searchDescription=""
      createLabel={isOwner ? "Asignar partner" : undefined}
    />
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ProjectPartnersSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-2.5 border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent">
        <Skeleton className="h-3 w-48" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center px-5 py-3.5 border-b border-border last:border-b-0">
          <div className="flex-1">
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-3 w-32 hidden sm:block" />
        </div>
      ))}
    </div>
  )
}
