"use client"

import { LayoutGrid, List } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ViewMode } from "@/types/project"
import { useLanguage } from "@/context/language-context"

interface SectionToolbarProps {
  sort: string
  sortOptions: { value: string; label: string }[]
  onSortChange: (s: string) => void
  pageSize: number
  onPageSizeChange: (s: number) => void
  viewMode: ViewMode
  onViewModeChange: (m: ViewMode) => void
  accentClass: string
  borderClass: string
}

export function SectionToolbar({
  sort,
  sortOptions,
  onSortChange,
  pageSize,
  onPageSizeChange,
  viewMode,
  onViewModeChange,
  accentClass,
  borderClass,
}: SectionToolbarProps) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="h-7 w-auto min-w-28 text-xs" aria-label={t("common.sortBy")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
        <SelectTrigger className="h-7 w-auto min-w-14 text-xs" aria-label={t("common.perPage")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="6">6</SelectItem>
          <SelectItem value="12">12</SelectItem>
          <SelectItem value="24">24</SelectItem>
        </SelectContent>
      </Select>

      <div
        className={cn("flex items-center h-7 border rounded-md overflow-hidden", borderClass)}
        role="radiogroup"
        aria-label={t("common.viewMode")}
      >
        <button
          type="button"
          onClick={() => onViewModeChange("shelf")}
          role="radio"
          aria-checked={viewMode === "shelf"}
          aria-label={t("common.gridView")}
          className={cn(
            "flex items-center justify-center size-7 transition-colors duration-150",
            viewMode === "shelf" ? accentClass : "text-muted-foreground hover:bg-accent/50",
          )}
        >
          <LayoutGrid className="size-3" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          role="radio"
          aria-checked={viewMode === "list"}
          aria-label={t("common.listView")}
          className={cn(
            "flex items-center justify-center size-7 border-l transition-colors duration-150",
            borderClass,
            viewMode === "list" ? accentClass : "text-muted-foreground hover:bg-accent/50",
          )}
        >
          <List className="size-3" />
        </button>
      </div>
    </div>
  )
}
