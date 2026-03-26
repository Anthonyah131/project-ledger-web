"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/context/language-context"
import type { ObligationStatus } from "@/types/obligation"

const PAGE_SIZES = ["10", "20", "50"]

interface ObligationsToolbarProps {
  sort: string
  onSortChange: (sort: string) => void
  statusFilter: string
  onStatusFilterChange: (status: "all" | ObligationStatus) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  onCreate: () => void
}

export function ObligationsToolbar({
  sort,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  pageSize,
  onPageSizeChange,
  onCreate,
}: ObligationsToolbarProps) {
  const { t } = useLanguage()

  const SORT_OPTIONS = [
    { value: "dueDate:asc", label: t("obligations.sortDueDateAsc") },
    { value: "dueDate:desc", label: t("obligations.sortDueDateDesc") },
    { value: "totalAmount:desc", label: t("obligations.sortAmountDesc") },
    { value: "totalAmount:asc", label: t("obligations.sortAmountAsc") },
    { value: "title:asc", label: t("obligations.sortTitleAZ") },
    { value: "createdAt:desc", label: t("obligations.sortRecent") },
  ]

  const STATUS_OPTIONS = [
    { value: "all", label: t("obligations.statusAll") },
    { value: "open", label: t("obligations.statusOpen") },
    { value: "partially_paid", label: t("obligations.statusPartiallyPaid") },
    { value: "paid", label: t("obligations.statusPaid") },
    { value: "overdue", label: t("obligations.statusOverdue") },
  ]

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Sort */}
      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-45 h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as "all" | ObligationStatus)}>
        <SelectTrigger className="w-40 h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Page size */}
      <Select
        value={String(pageSize)}
        onValueChange={(v) => onPageSizeChange(Number(v))}
      >
        <SelectTrigger className="w-17.5 h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Create */}
      <div className="ml-auto">
        <Button
          size="sm"
          className="h-9 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 border-0 shadow-sm shadow-violet-500/30 transition-all"
          onClick={onCreate}
        >
          <Plus className="size-4 mr-1.5" />
          {t("obligations.new")}
        </Button>
      </div>
    </div>
  )
}
