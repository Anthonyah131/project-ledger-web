"use client"

import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CategoryResponse } from "@/types/category"

interface ExpensesToolbarProps {
  query: string
  onQueryChange: (q: string) => void
  activeStatus: "all" | "active" | "inactive"
  onActiveStatusChange: (value: "all" | "active" | "inactive") => void
  sort: string
  onSortChange: (s: string) => void
  pageSize: number
  onPageSizeChange: (s: number) => void
  categories: CategoryResponse[]
  categoryId: string
  onCategoryChange: (id: string) => void
  onCreateManual: () => void
  onCreateWithAi: () => void
}

export function ExpensesToolbar({
  query,
  onQueryChange,
  activeStatus,
  onActiveStatusChange,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  categories,
  categoryId,
  onCategoryChange,
  onCreateManual,
  onCreateWithAi,
}: ExpensesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-1 min-w-36 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar por titulo..."
            className="pl-8.5 h-8 text-sm"
            aria-label="Buscar gastos"
          />
        </div>
        {categories.length > 0 && (
          <Select value={categoryId || "all"} onValueChange={(v) => onCategoryChange(v === "all" ? "" : v)}>
            <SelectTrigger className="w-auto min-w-36 h-8 text-sm" aria-label="Filtrar por categoría">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={activeStatus} onValueChange={onActiveStatusChange}>
          <SelectTrigger className="w-auto min-w-40 h-8 text-sm" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Contabilizados</SelectItem>
            <SelectItem value="inactive">Recordatorios</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-auto min-w-40 h-8 text-sm" aria-label="Ordenar">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expenseDate:desc">Fecha (reciente)</SelectItem>
            <SelectItem value="expenseDate:asc">Fecha (antigua)</SelectItem>
            <SelectItem value="title:asc">Título A - Z</SelectItem>
            <SelectItem value="convertedAmount:desc">Mayor monto</SelectItem>
            <SelectItem value="createdAt:desc">Recién creados</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="w-auto min-w-16 h-8 text-sm" aria-label="Por página">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onCreateManual}
          size="sm"
          className="bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 border-0 shadow-sm shadow-rose-500/30 transition-all"
        >
          <Plus className="size-3.5" />
          Nuevo gasto
        </Button>
        <Button
          onClick={onCreateWithAi}
          size="sm"
          variant="outline"
          className="border-rose-500/40 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/60"
        >
          Con IA
        </Button>
      </div>
    </div>
  )
}
