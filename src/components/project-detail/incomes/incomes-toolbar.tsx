"use client"

import { Search, Plus, Table2, List, CalendarDays } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/context/language-context"
import type { CategoryResponse } from "@/types/category"

interface IncomesToolbarProps {
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
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onCreateManual: () => void
  onCreateWithAi: () => void
  onBulkImport: () => void
  viewMode?: "list" | "calendar"
  onViewModeChange?: (mode: "list" | "calendar") => void
}

export function IncomesToolbar({
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
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onCreateManual,
  onCreateWithAi,
  onBulkImport,
  viewMode = "list",
  onViewModeChange,
}: IncomesToolbarProps) {
  const { t } = useLanguage()

  const isCalendar = viewMode === "calendar"
  const hasActiveFilters = isCalendar
    ? (!!categoryId || activeStatus !== "active")
    : (!!query || !!categoryId || activeStatus !== "active" || !!dateFrom || !!dateTo)

  function clearFilters() {
    if (!isCalendar) {
      onQueryChange("")
      onDateFromChange("")
      onDateToChange("")
    }
    onCategoryChange("")
    onActiveStatusChange("active")
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {/* View mode toggle */}
        <div className="flex gap-1 border-r border-border pr-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange?.("list")}
            aria-pressed={viewMode === "list"}
            title="Lista"
          >
            <List className="size-3.5" />
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange?.("calendar")}
            aria-pressed={viewMode === "calendar"}
            title="Calendario"
          >
            <CalendarDays className="size-3.5" />
          </Button>
        </div>

        {/* Search — list only */}
        {!isCalendar && (
          <div className="relative flex-1 min-w-36 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t("incomes.searchPlaceholder")}
              className="pl-8.5 h-8 text-sm"
              aria-label={t("incomes.searchAriaLabel")}
            />
          </div>
        )}

        {/* Category — both modes */}
        {categories.length > 0 && (
          <Select value={categoryId || "all"} onValueChange={(v) => onCategoryChange(v === "all" ? "" : v)}>
            <SelectTrigger className="w-auto min-w-36 h-8 text-sm" aria-label={t("incomes.filterByCategoryAria")}>
              <SelectValue placeholder={t("incomes.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("incomes.allCategories")}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status — both modes */}
        <Select value={activeStatus} onValueChange={onActiveStatusChange}>
          <SelectTrigger className="w-auto min-w-40 h-8 text-sm" aria-label={t("incomes.filterByStatusAria")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t("incomes.statusActive")}</SelectItem>
            <SelectItem value="inactive">{t("incomes.statusInactive")}</SelectItem>
            <SelectItem value="all">{t("common.all")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort, pageSize, dates — list only */}
        {!isCalendar && (
          <>
            <Select value={sort} onValueChange={onSortChange}>
              <SelectTrigger className="w-auto min-w-40 h-8 text-sm" aria-label={t("common.sortBy")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incomeDate:desc">{t("incomes.sortDateDesc")}</SelectItem>
                <SelectItem value="incomeDate:asc">{t("incomes.sortDateAsc")}</SelectItem>
                <SelectItem value="title:asc">{t("incomes.sortTitleAZ")}</SelectItem>
                <SelectItem value="convertedAmount:desc">{t("incomes.sortAmountDesc")}</SelectItem>
                <SelectItem value="createdAt:desc">{t("incomes.sortRecentlyCreated")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
              <SelectTrigger className="w-auto min-w-16 h-8 text-sm" aria-label={t("common.perPage")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="h-8 text-sm w-auto"
              aria-label={t("common.dateFrom")}
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="h-8 text-sm w-auto"
              aria-label={t("common.dateTo")}
            />
          </>
        )}

        {/* Clear all filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearFilters}
          >
            {t("common.clear")}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={onCreateManual}
          size="sm"
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 border-0 shadow-sm shadow-emerald-500/30 transition-all"
        >
          <Plus className="size-3.5" />
          {t("incomes.new")}
        </Button>
        <Button
          onClick={onBulkImport}
          size="sm"
          variant="outline"
          className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60"
        >
          <Table2 className="size-3.5" />
          {t("bulkImport.title")}
        </Button>
        <Button
          onClick={onCreateWithAi}
          size="sm"
          variant="outline"
          className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/60"
        >
          {t("incomes.withAI")}
        </Button>
      </div>
    </div>
  )
}
