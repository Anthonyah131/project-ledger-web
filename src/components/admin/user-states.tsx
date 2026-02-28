"use client"

import { Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState as GenericEmptyState } from "@/components/shared/empty-state"

// ─── Empty State ──────────────────────────────────────────────────────────────

export function AdminUsersEmptyState() {
  return (
    <GenericEmptyState
      hasSearch={false}
      onCreate={() => {}}
      icon={Users}
      title="Sin usuarios"
      description="No se encontraron usuarios registrados."
    />
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function AdminUsersSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Header row */}
      <div className="px-5 py-2.5 border-b border-border bg-muted/30">
        <Skeleton className="h-3 w-96" />
      </div>
      {/* Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center px-5 py-3.5 border-b border-border last:border-b-0"
        >
          <Skeleton className="size-8 rounded-full shrink-0 mr-3" />
          <div className="flex-1 min-w-0 mr-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48 mt-1.5" />
          </div>
          <Skeleton className="h-4 w-14 rounded-full mr-4 hidden sm:block" />
          <Skeleton className="h-4 w-12 rounded-full mr-4 hidden md:block" />
          <Skeleton className="h-3 w-24 hidden lg:block" />
        </div>
      ))}
    </div>
  )
}
