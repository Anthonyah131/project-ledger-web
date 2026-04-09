"use client"

import { TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ReportFilters } from "@/components/reports/report-filters"
import { IncomeReportResults } from "@/components/reports/income-report-results"
import { ReportEmptyPrompt, ReportNoData, ReportSkeleton } from "@/components/reports/report-states"
import type { ProjectResponse } from "@/types/project"
import type { ProjectIncomeReportResponse } from "@/types/report"
import { useLanguage } from "@/context/language-context"

interface ReportsIncomesTabProps {
  projects: ProjectResponse[]
  catalogsLoading?: boolean
  from: string
  to: string
  projectId: string
  dateRangeError: string | null
  loading: boolean
  exporting: boolean
  report: ProjectIncomeReportResponse | null
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onProjectChange: (value: string) => void
  onGenerate: () => void
  onExport: (format: "excel" | "pdf") => void
}

export function ReportsIncomesTab({
  projects,
  catalogsLoading,
  from,
  to,
  projectId,
  dateRangeError,
  loading,
  exporting,
  report,
  onFromChange,
  onToChange,
  onProjectChange,
  onGenerate,
  onExport,
}: ReportsIncomesTabProps) {
  const { t } = useLanguage()
  return (
    <TabsContent value="incomes" className="flex flex-col gap-6 mt-4">
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
          <Label className="text-xs text-muted-foreground">{t("reports.projectLabel")}</Label>
          {catalogsLoading ? (
            <Skeleton className="h-8 w-52 rounded-md" />
          ) : (
            <Select value={projectId} onValueChange={onProjectChange}>
              <SelectTrigger size="sm" className="w-52">
                <SelectValue placeholder={t("reports.selectProjectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </ReportFilters>

      {loading ? (
        <ReportSkeleton />
      ) : report ? (
        report.totalIncomeCount === 0 ? (
          <ReportNoData />
        ) : (
          <IncomeReportResults report={report} />
        )
      ) : (
        <ReportEmptyPrompt />
      )}
    </TabsContent>
  )
}
