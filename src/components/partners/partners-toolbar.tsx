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
import { useLanguage } from "@/context/language-context"

interface PartnersToolbarProps {
  query: string
  onQueryChange: (q: string) => void
  sort: string
  onSortChange: (s: string) => void
  viewMode: ViewMode
  onViewModeChange: (m: ViewMode) => void
  pageSize: number
  onPageSizeChange: (s: number) => void
}

export function PartnersToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  pageSize,
  onPageSizeChange,
}: PartnersToolbarProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: search */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("partners.searchPlaceholder")}
            className="pl-8.5 h-8 text-sm focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
            aria-label={t("partners.searchAriaLabel")}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Right: sort + page size + view toggle */}
      <div className="flex items-center gap-2">
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-auto min-w-27.5 h-8 text-sm" aria-label={t("common.sortBy")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name:asc">{t("common.sortAZ")}</SelectItem>
            <SelectItem value="name:desc">{t("common.sortZA")}</SelectItem>
            <SelectItem value="updatedAt:desc">{t("common.sortRecent")}</SelectItem>
            <SelectItem value="createdAt:desc">{t("common.sortNew")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-auto min-w-15 h-8 text-sm" aria-label={t("common.perPage")}>
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
          className="flex items-center h-8 border border-violet-500/30 rounded-md overflow-hidden"
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
              "flex items-center justify-center size-8 transition-colors duration-150",
              viewMode === "shelf"
                ? "bg-linear-to-br from-violet-600 to-purple-700 text-white shadow-sm"
                : "text-muted-foreground hover:text-violet-600 hover:bg-violet-500/10",
            )}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            role="radio"
            aria-checked={viewMode === "list"}
            aria-label={t("common.listView")}
            className={cn(
              "flex items-center justify-center size-8 border-l border-violet-500/30 transition-colors duration-150",
              viewMode === "list"
                ? "bg-linear-to-br from-violet-600 to-purple-700 text-white shadow-sm"
                : "text-muted-foreground hover:text-violet-600 hover:bg-violet-500/10",
            )}
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
