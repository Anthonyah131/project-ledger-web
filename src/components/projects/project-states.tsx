"use client"

import { FolderOpen, Plus, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface EmptyStateProps {
  hasSearch: boolean
  onCreate: () => void
}

export function EmptyState({ hasSearch, onCreate }: EmptyStateProps) {
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
          {hasSearch ? "Sin resultados" : "No hay proyectos"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-[260px] leading-relaxed">
          {hasSearch
            ? "No se encontraron proyectos con ese criterio."
            : "Crea tu primer proyecto para comenzar."}
        </p>
      </div>
      {!hasSearch && (
        <Button onClick={onCreate} size="sm" className="mt-1">
          <Plus className="size-3.5" />
          Crear proyecto
        </Button>
      )}
    </div>
  )
}

export function ShelfSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card p-5">
          <div className="flex gap-4">
            <Skeleton className="w-1 h-20 rounded-full" />
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48 mt-2" />
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-3 w-14 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="px-5 py-2.5 border-b border-border bg-muted/30">
        <Skeleton className="h-3 w-64" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center px-5 py-3.5 border-b border-border last:border-b-0"
        >
          <Skeleton className="size-2 rounded-full shrink-0 mr-3.5" />
          <div className="flex-1 min-w-0 mr-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52 mt-1.5" />
          </div>
          <Skeleton className="w-10 h-3 hidden sm:block" />
          <Skeleton className="w-16 h-4 rounded-full hidden md:block ml-4" />
          <Skeleton className="w-20 h-3 hidden lg:block ml-4" />
        </div>
      ))}
    </div>
  )
}
