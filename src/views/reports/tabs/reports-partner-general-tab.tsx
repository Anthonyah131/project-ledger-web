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
import { PartnerGeneralReportResults } from "@/components/reports/partner-general-report-results"
import { ReportEmptyPrompt, ReportNoData, ReportSkeleton } from "@/components/reports/report-states"
import type { PartnerResponse } from "@/types/partner"
import type { PartnerGeneralReportResponse } from "@/types/report"

interface ReportsPartnerGeneralTabProps {
  partners: PartnerResponse[]
  from: string
  to: string
  partnerId: string
  dateRangeError: string | null
  loading: boolean
  exporting: boolean
  report: PartnerGeneralReportResponse | null
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onPartnerChange: (value: string) => void
  onGenerate: () => void
  onExport: (format: "excel" | "pdf") => void
}

export function ReportsPartnerGeneralTab({
  partners,
  from,
  to,
  partnerId,
  dateRangeError,
  loading,
  exporting,
  report,
  onFromChange,
  onToChange,
  onPartnerChange,
  onGenerate,
  onExport,
}: ReportsPartnerGeneralTabProps) {
  return (
    <TabsContent value="partner-general" className="flex flex-col gap-6 mt-4">
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
          <Label className="text-xs text-muted-foreground">Partner</Label>
          <Select value={partnerId} onValueChange={onPartnerChange}>
            <SelectTrigger size="sm" className="w-52">
              <SelectValue placeholder="Selecciona partner" />
            </SelectTrigger>
            <SelectContent>
              {partners.length === 0 ? (
                <SelectItem value="__none" disabled>
                  Sin partners registrados
                </SelectItem>
              ) : (
                partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </ReportFilters>

      {loading ? (
        <ReportSkeleton />
      ) : report ? (
        report.projects.length === 0 ? (
          <ReportNoData />
        ) : (
          <PartnerGeneralReportResults report={report} />
        )
      ) : (
        <ReportEmptyPrompt />
      )}
    </TabsContent>
  )
}
