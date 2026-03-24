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
import { ReportFilters } from "@/components/reports/report-filters"
import { ExpenseReportResults } from "@/components/reports/expense-report-results"
import { ReportEmptyPrompt, ReportNoData, ReportSkeleton } from "@/components/reports/report-states"
import type { ProjectResponse } from "@/types/project"
import type { ProjectExpenseReportResponse } from "@/types/report"
import { useLanguage } from "@/context/language-context"

interface ReportsExpensesTabProps {
  projects: ProjectResponse[]
  from: string
  to: string
  projectId: string
  dateRangeError: string | null
  loading: boolean
  exporting: boolean
  report: ProjectExpenseReportResponse | null
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onProjectChange: (value: string) => void
  onGenerate: () => void
  onExport: (format: "excel" | "pdf") => void
}

export function ReportsExpensesTab({
  projects,
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
}: ReportsExpensesTabProps) {
  const { t } = useLanguage()
  return (
    <TabsContent value="expenses" className="flex flex-col gap-6 mt-4">
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
        </div>
      </ReportFilters>

      {loading ? (
        <ReportSkeleton />
      ) : report ? (
        report.totalExpenseCount === 0 && (report.totalIncomeCount ?? 0) === 0 ? (
          <ReportNoData />
        ) : (
          <ExpenseReportResults report={report} />
        )
      ) : (
        <ReportEmptyPrompt />
      )}
    </TabsContent>
  )
}
