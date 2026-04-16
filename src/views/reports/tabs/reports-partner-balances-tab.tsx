"use client"

import { useMemo } from "react"
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
import { PartnerBalancesReportResults } from "@/components/reports/partner-balances-report-results"
import { ReportEmptyPrompt, ReportNoData, ReportSkeleton } from "@/components/reports/report-states"
import type { ProjectResponse } from "@/types/project"
import type { PartnerBalancesReportResponse } from "@/types/report"
import { useLanguage } from "@/context/language-context"

interface ReportsPartnerBalancesTabProps {
  projects: ProjectResponse[]
  catalogsLoading?: boolean
  from: string
  to: string
  projectId: string
  dateRangeError: string | null
  loading: boolean
  exporting: boolean
  report: PartnerBalancesReportResponse | null
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onProjectChange: (value: string) => void
  onGenerate: () => void
  onExport: (format: "excel" | "pdf") => void
  canExport?: boolean
}

export function ReportsPartnerBalancesTab({
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
  canExport,
}: ReportsPartnerBalancesTabProps) {
  const { t } = useLanguage()
  const partnerProjects = useMemo(
    () => projects.filter((p) => p.partnersEnabled),
    [projects],
  )

  return (
    <TabsContent value="partner-balances" className="flex flex-col gap-6 mt-4">
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
        canExport={canExport}
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
                {partnerProjects.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    {t("reports.noProjectsWithPartners")}
                  </SelectItem>
                ) : (
                  partnerProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </ReportFilters>

      {loading ? (
        <ReportSkeleton />
      ) : report ? (
        report.partners.length === 0 ? (
          <ReportNoData />
        ) : (
          <PartnerBalancesReportResults report={report} />
        )
      ) : (
        <ReportEmptyPrompt />
      )}
    </TabsContent>
  )
}
