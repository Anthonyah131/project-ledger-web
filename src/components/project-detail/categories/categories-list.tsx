"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { CategoryResponse } from "@/types/category"

const ACCENT_COLORS = [
  "oklch(0.55 0.20 255)",
  "oklch(0.55 0.20 290)",
  "oklch(0.55 0.20 330)",
  "oklch(0.60 0.18 20)",
  "oklch(0.60 0.16 55)",
  "oklch(0.55 0.18 145)",
  "oklch(0.50 0.15 200)",
  "oklch(0.55 0.18 175)",
]

function formatBudget(amount: number | null): string {
  if (amount === null || amount === undefined) return "Sin límite"
  return new Intl.NumberFormat("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface CategoriesListProps {
  categories: CategoryResponse[]
  onEdit: (cat: CategoryResponse) => void
  onDelete: (cat: CategoryResponse) => void
}

export function CategoriesList({
  categories,
  onEdit,
  onDelete,
}: CategoriesListProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-2 bg-muted/30">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
          Nombre
        </span>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest w-32 text-right">
          Presupuesto
        </span>
        <span className="w-8" />
      </div>

      {/* Rows */}
      {categories.map((cat, idx) => {
        const color = ACCENT_COLORS[idx % ACCENT_COLORS.length]
        return (
          <div
            key={cat.id}
            className="group grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 hover:bg-accent/30 transition-colors duration-150 border-t first:border-t-0"
          >
            {/* Name + description */}
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {cat.name}
                  </span>
                  {cat.isDefault && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Por defecto
                    </Badge>
                  )}
                </div>
                {cat.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {cat.description}
                  </p>
                )}
              </div>
            </div>

            {/* Budget */}
            <span className="text-sm tabular-nums w-32 text-right font-medium">
              {formatBudget(cat.budgetAmount)}
            </span>

            {/* Actions */}
            <div className="w-8 flex justify-end">
              {!cat.isDefault ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Opciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(cat)}>
                      <Pencil className="size-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(cat)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="size-8" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
