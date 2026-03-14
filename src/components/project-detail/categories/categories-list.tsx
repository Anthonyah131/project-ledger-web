"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import { getAccentColorRaw } from "@/lib/constants"
import { formatAmount } from "@/lib/format-utils"
import type { CategoryResponse } from "@/types/category"

interface CategoriesListProps {
  categories: CategoryResponse[]
  onEdit: (cat: CategoryResponse) => void
  onDelete: (cat: CategoryResponse) => void
}

function CategoriesListComponent({
  categories,
  onEdit,
  onDelete,
}: CategoriesListProps) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-card shadow-sm shadow-amber-500/5 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-2.5 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-amber-500/20">
        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
          Nombre
        </span>
        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest w-32 text-right">
          Presupuesto
        </span>
        <span className="w-8" />
      </div>

      {/* Rows */}
      {categories.map((cat, idx) => {
        const color = getAccentColorRaw(idx)
        return (
          <div
            key={cat.id}
            className="group grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-amber-500/5 transition-colors duration-150 border-t border-border/50 first:border-t-0"
          >
            {/* Name + description */}
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="size-2.5 shrink-0 rounded-full ring-2 ring-offset-1 ring-offset-card"
                style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate">
                    {cat.name}
                  </span>
                  {cat.isDefault && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
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
            <span className="text-sm tabular-nums w-32 text-right font-bold text-amber-700 dark:text-amber-400">
              {formatAmount(cat.budgetAmount)}
            </span>

            {/* Actions */}
            <div className="w-8 flex justify-end">
              {!cat.isDefault ? (
                <ItemActionMenu
                  variant="ghost"
                  onEdit={() => onEdit(cat)}
                  onDelete={() => onDelete(cat)}
                />
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

export const CategoriesList = memo(CategoriesListComponent)
