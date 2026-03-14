"use client"

import { AlertCircle, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateInput } from "@/components/ui/date-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PaymentMethodProjectsResponse } from "@/types/payment-method"

interface PaymentMethodDetailFiltersProps {
  projects: PaymentMethodProjectsResponse
  from: string
  to: string
  activeStatus: "all" | "active" | "inactive"
  projectId: string
  dateRangeError: string | null
  setFrom: (value: string) => void
  setTo: (value: string) => void
  setProjectId: (value: string) => void
  setActiveStatus: (value: "all" | "active" | "inactive") => void
  clearFilters: () => void
}

export function PaymentMethodDetailFilters({
  projects,
  from,
  to,
  activeStatus,
  projectId,
  dateRangeError,
  setFrom,
  setTo,
  setProjectId,
  setActiveStatus,
  clearFilters,
}: PaymentMethodDetailFiltersProps) {
  const hasFilters =
    from.length > 0 || to.length > 0 || projectId.length > 0 || activeStatus !== "active"

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="size-4 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Filtros compartidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.3fr_1fr_auto] gap-3">
        <DateInput
          id="payment-method-from"
          name="paymentMethodFrom"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          aria-label="Fecha desde"
          max={to || undefined}
          aria-invalid={Boolean(dateRangeError)}
          autoComplete="off"
        />

        <DateInput
          id="payment-method-to"
          name="paymentMethodTo"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          aria-label="Fecha hasta"
          min={from || undefined}
          aria-invalid={Boolean(dateRangeError)}
          autoComplete="off"
        />

        <Select value={projectId || "all"} onValueChange={(value) => setProjectId(value === "all" ? "" : value)}>
          <SelectTrigger aria-label="Filtrar por proyecto">
            <SelectValue placeholder="Todos los proyectos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            {projects.items.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger aria-label="Filtrar por estado contable">
            <SelectValue placeholder="Contabilizados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Contabilizados</SelectItem>
            <SelectItem value="inactive">Recordatorios</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        <Button type="button" variant="outline" onClick={clearFilters} disabled={!hasFilters}>
          <X className="size-4" />
          Limpiar
        </Button>
      </div>

      {dateRangeError && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5" />
          <span>{dateRangeError}</span>
        </div>
      )}
    </div>
  )
}
