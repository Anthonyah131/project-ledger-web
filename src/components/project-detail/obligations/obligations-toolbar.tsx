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

import type { ObligationStatus } from "@/types/obligation"

const SORT_OPTIONS = [
  { value: "dueDate:asc", label: "Vencimiento (próximo)" },
  { value: "dueDate:desc", label: "Vencimiento (lejano)" },
  { value: "totalAmount:desc", label: "Monto (mayor)" },
  { value: "totalAmount:asc", label: "Monto (menor)" },
  { value: "title:asc", label: "Título (A-Z)" },
  { value: "createdAt:desc", label: "Reciente" },
]

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "open", label: "Abierta" },
  { value: "partially_paid", label: "Pago parcial" },
  { value: "paid", label: "Pagada" },
  { value: "overdue", label: "Vencida" },
]

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
        <Button size="sm" className="h-9" onClick={onCreate}>
          <Plus className="size-4 mr-1.5" />
          Nueva obligación
        </Button>
      </div>
    </div>
  )
}
