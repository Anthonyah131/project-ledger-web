"use client"

// components/reports/report-filters.tsx
// Shared filter toolbar for report views: date range + format selector.

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, FileSpreadsheet, Download } from "lucide-react"

interface ReportFiltersProps {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onGenerate: () => void
  onExport: (format: "excel" | "pdf") => void
  loading: boolean
  exporting: boolean
  /** Extra controls to render between dates and actions */
  children?: React.ReactNode
}

export function ReportFilters({
  from,
  to,
  onFromChange,
  onToChange,
  onGenerate,
  onExport,
  loading,
  exporting,
  children,
}: ReportFiltersProps) {
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "">("")

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-end gap-4">
        {/* Date range */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-from" className="text-xs text-muted-foreground">
            Desde
          </Label>
          <Input
            id="report-from"
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-40"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="report-to" className="text-xs text-muted-foreground">
            Hasta
          </Label>
          <Input
            id="report-to"
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="w-40"
          />
        </div>

        {children}

        {/* Actions */}
        <div className="flex items-end gap-2 ml-auto">
          <Button onClick={onGenerate} disabled={loading || exporting} size="sm">
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileText className="size-3.5" />
            )}
            Generar
          </Button>

          <div className="flex items-center gap-1.5">
            <Select
              value={exportFormat}
              onValueChange={(v) => setExportFormat(v as "excel" | "pdf")}
              disabled={loading || exporting}
            >
              <SelectTrigger size="sm" className="w-36" aria-label="Formato de exportación">
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <FileSpreadsheet className="size-3.5" />
                  Excel (.xlsx)
                </SelectItem>
                <SelectItem value="pdf">
                  <FileText className="size-3.5" />
                  PDF
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="secondary"
              disabled={!exportFormat || loading || exporting}
              onClick={() => exportFormat && onExport(exportFormat)}
            >
              {exporting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              Descargar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
