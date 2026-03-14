"use client"

import { Search, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ViewMode } from "@/types/project"

interface PaymentMethodsToolbarProps {
  query: string
  onQueryChange: (q: string) => void
  typeFilter: string
  onTypeFilterChange: (t: string) => void
  sort: string
  onSortChange: (s: string) => void
  viewMode: ViewMode
  onViewModeChange: (m: ViewMode) => void
  pageSize: number
  onPageSizeChange: (s: number) => void
}

export function PaymentMethodsToolbar({
  query,
  onQueryChange,
  typeFilter,
  onTypeFilterChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  pageSize,
  onPageSizeChange,
}: PaymentMethodsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: search + type filter */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            id="payment-methods-search"
            name="paymentMethodsSearch"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar…"
            className="pl-8.5 h-8 text-sm focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50"
            aria-label="Buscar métodos de pago"
            autoComplete="off"
          />
        </div>
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-auto min-w-35 h-8 text-sm" aria-label="Filtrar por tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="bank">Banco</SelectItem>
            <SelectItem value="card">Tarjeta</SelectItem>
            <SelectItem value="cash">Efectivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right: sort + page size + view toggle */}
      <div className="flex items-center gap-2">
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-auto min-w-27.5 h-8 text-sm" aria-label="Ordenar">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt:desc">Recientes</SelectItem>
            <SelectItem value="name:asc">A - Z</SelectItem>
            <SelectItem value="name:desc">Z - A</SelectItem>
            <SelectItem value="createdAt:desc">Nuevos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-auto min-w-15 h-8 text-sm" aria-label="Por página">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="48">48</SelectItem>
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div
          className="flex items-center h-8 border border-cyan-500/30 rounded-md overflow-hidden"
          role="radiogroup"
          aria-label="Modo de vista"
        >
          <button
            type="button"
            onClick={() => onViewModeChange("shelf")}
            role="radio"
            aria-checked={viewMode === "shelf"}
            aria-label="Vista cuadrícula"
            className={cn(
              "flex items-center justify-center size-8 transition-colors duration-150",
              viewMode === "shelf"
                ? "bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-cyan-600 hover:bg-cyan-500/10",
            )}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            role="radio"
            aria-checked={viewMode === "list"}
            aria-label="Vista lista"
            className={cn(
              "flex items-center justify-center size-8 border-l border-cyan-500/30 transition-colors duration-150",
              viewMode === "list"
                ? "bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-cyan-600 hover:bg-cyan-500/10",
            )}
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
