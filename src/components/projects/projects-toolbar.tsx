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
import { CURRENCY_OPTIONS } from "@/types/project"
import { useLanguage } from "@/context/language-context"

interface ToolbarProps {
  query: string
  onQueryChange: (q: string) => void
  currency: string
  onCurrencyChange: (c: string) => void
  sort: string
  onSortChange: (s: string) => void
  viewMode: ViewMode
  onViewModeChange: (m: ViewMode) => void
  pageSize: number
  onPageSizeChange: (s: number) => void
}

export function ProjectsToolbar({
  query,
  onQueryChange,
  currency,
  onCurrencyChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  pageSize,
  onPageSizeChange,
}: ToolbarProps) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: search + currency */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("projects.toolbar.searchPlaceholder")}
            className="pl-8.5 h-8 text-sm"
            aria-label={t("projects.toolbar.searchAriaLabel")}
          />
        </div>
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger className="w-auto min-w-32.5 h-8 text-sm" aria-label={t("projects.filterByCurrency")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: sort + page size + view */}
      <div className="flex items-center gap-2">
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-auto min-w-27.5 h-8 text-sm" aria-label={t("projects.toolbar.sortAriaLabel")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt:desc">{t("projects.sortRecent")}</SelectItem>
            <SelectItem value="name:asc">{t("projects.sortAZ")}</SelectItem>
            <SelectItem value="name:desc">{t("projects.sortZA")}</SelectItem>
            <SelectItem value="createdAt:desc">{t("projects.sortNew")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-auto min-w-15 h-8 text-sm" aria-label={t("projects.toolbar.pageSizeAriaLabel")}>
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
          className="flex items-center h-8 border border-border rounded-md overflow-hidden"
          role="radiogroup"
          aria-label={t("projects.toolbar.viewAriaLabel")}
        >
          <button
            onClick={() => onViewModeChange("shelf")}
            role="radio"
            aria-checked={viewMode === "shelf"}
            aria-label={t("projects.toolbar.shelfViewAriaLabel")}
            className={cn(
              "flex items-center justify-center size-8 transition-colors duration-150",
              viewMode === "shelf"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            role="radio"
            aria-checked={viewMode === "list"}
            aria-label={t("projects.toolbar.listViewAriaLabel")}
            className={cn(
              "flex items-center justify-center size-8 border-l border-border transition-colors duration-150",
              viewMode === "list"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
