"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface AdminUsersToolbarProps {
  sort: string
  onSortChange: (s: string) => void
  pageSize: number
  onPageSizeChange: (s: number) => void
  includeDeleted: boolean
  onIncludeDeletedChange: (v: boolean) => void
}

export function AdminUsersToolbar({
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  includeDeleted,
  onIncludeDeletedChange,
}: AdminUsersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: include deleted toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="includeDeleted"
          checked={includeDeleted}
          onCheckedChange={(v) => onIncludeDeletedChange(v === true)}
        />
        <Label htmlFor="includeDeleted" className="text-sm font-normal cursor-pointer">
          Incluir eliminados
        </Label>
      </div>

      {/* Right: sort + page size */}
      <div className="flex items-center gap-2">
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-auto min-w-40 h-8 text-sm" aria-label="Ordenar por">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt:desc">Más recientes</SelectItem>
            <SelectItem value="createdAt:asc">Más antiguos</SelectItem>
            <SelectItem value="fullName:asc">Nombre A–Z</SelectItem>
            <SelectItem value="fullName:desc">Nombre Z–A</SelectItem>
            <SelectItem value="lastLoginAt:desc">Último acceso</SelectItem>
          </SelectContent>
        </Select>

        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-auto min-w-20 h-8 text-sm" aria-label="Registros por página">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
