"use client"

import { Tag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"

interface EmptyProps {
  hasSearch: boolean
  onCreate: () => void
}

export function CategoriesEmptyState({ hasSearch, onCreate }: EmptyProps) {
  return (
    <EmptyState
      hasSearch={hasSearch}
      onCreate={onCreate}
      icon={Tag}
      title="Sin categorías adicionales"
      description="Agrega categorías para organizar tus gastos."
      searchDescription="No se encontraron categorías que coincidan con tu búsqueda."
      createLabel="Nueva categoría"
    />
  )
}

export function CategoriesSkeleton() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-2.5 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-amber-500/20">
        <Skeleton className="h-3 w-20" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3 border-t first:border-t-0"
        >
          <Skeleton className="size-2.5 rounded-full shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}
