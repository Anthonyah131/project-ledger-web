"use client"

// components/reports/report-states.tsx
// Loading skeleton + empty states for report views.

import { Skeleton } from "@/components/ui/skeleton"
import { FileText, SearchX } from "lucide-react"

export function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export function ReportEmptyPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="flex items-center justify-center size-12 rounded-xl bg-muted">
        <FileText className="size-5 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-foreground">
          Genera un reporte
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-65 leading-relaxed">
          Configura los filtros y presiona &quot;Generar&quot; para ver los datos del reporte.
        </p>
      </div>
    </div>
  )
}

export function ReportNoData() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="flex items-center justify-center size-12 rounded-xl bg-muted">
        <SearchX className="size-5 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold text-foreground">
          Sin datos
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-65 leading-relaxed">
          No se encontraron registros para el periodo seleccionado.
        </p>
      </div>
    </div>
  )
}
