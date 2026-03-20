"use client"

import { TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReportFilters } from "@/components/reports/report-filters"
import { WorkspaceReportResults } from "@/components/reports/workspace-report-results"
import { ReportEmptyPrompt, ReportNoData, ReportSkeleton } from "@/components/reports/report-states"
import type { WorkspaceResponse } from "@/types/workspace"
import type { WorkspaceReportResponse } from "@/types/report"

interface ReportsWorkspaceTabProps {
  workspaces: WorkspaceResponse[]
  from: string
  to: string
  workspaceId: string
  currency: string
  dateRangeError: string | null
  loading: boolean
  exporting: boolean
  report: WorkspaceReportResponse | null
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onWorkspaceChange: (value: string) => void
  onCurrencyChange: (value: string) => void
  onGenerate: () => void
  onExport: (format: "excel" | "pdf") => void
}

export function ReportsWorkspaceTab({
  workspaces,
  from,
  to,
  workspaceId,
  currency,
  dateRangeError,
  loading,
  exporting,
  report,
  onFromChange,
  onToChange,
  onWorkspaceChange,
  onCurrencyChange,
  onGenerate,
  onExport,
}: ReportsWorkspaceTabProps) {
  return (
    <TabsContent value="workspace" className="flex flex-col gap-6 mt-4">
      <ReportFilters
        from={from}
        to={to}
        onFromChange={onFromChange}
        onToChange={onToChange}
        onGenerate={onGenerate}
        onExport={onExport}
        loading={loading}
        exporting={exporting}
        dateRangeError={dateRangeError}
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Workspace</Label>
          <Select value={workspaceId} onValueChange={onWorkspaceChange}>
            <SelectTrigger size="sm" className="w-52">
              <SelectValue placeholder="Selecciona workspace" />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((ws) => (
                <SelectItem key={ws.id} value={ws.id}>
                  {ws.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            Moneda de referencia
          </Label>
          <Input
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value.toUpperCase())}
            placeholder="ej. USD"
            className="w-24 h-8 text-xs"
            maxLength={3}
          />
        </div>
      </ReportFilters>

      {loading ? (
        <ReportSkeleton />
      ) : report ? (
        report.projects.length === 0 ? (
          <ReportNoData />
        ) : (
          <WorkspaceReportResults report={report} />
        )
      ) : (
        <ReportEmptyPrompt />
      )}
    </TabsContent>
  )
}
