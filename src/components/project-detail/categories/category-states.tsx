"use client"

import { Tag, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface EmptyProps {
  hasSearch: boolean
  onCreate: () => void
}

export function CategoriesEmptyState({ hasSearch, onCreate }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {hasSearch ? (
        <SearchX className="size-10 text-muted-foreground/50 mb-3" />
      ) : (
        <Tag className="size-10 text-muted-foreground/50 mb-3" />
      )}
      <p className="text-sm font-medium text-foreground mb-1">
        {hasSearch ? "Sin resultados" : "Sin categorías adicionales"}
      </p>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs">
        {hasSearch
          ? "No se encontraron categorías que coincidan con tu búsqueda."
          : "Agrega categorías para organizar tus gastos."}
      </p>
      {!hasSearch && (
        <Button size="sm" onClick={onCreate}>
          Nueva categoría
        </Button>
      )}
    </div>
  )
}

export function CategoriesSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-2 bg-muted/30">
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
