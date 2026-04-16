"use client"

import { TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDownIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ReportFilters } from "@/components/reports/report-filters"
import { PaymentMethodReportResults } from "@/components/reports/payment-method-report-results"
import { ReportEmptyPrompt, ReportNoData, ReportSkeleton } from "@/components/reports/report-states"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { PaymentMethodReportResponse } from "@/types/report"
import { useLanguage } from "@/context/language-context"

interface ReportsPaymentMethodsTabProps {
  paymentMethods: PaymentMethodResponse[]
  catalogsLoading?: boolean
  from: string
  to: string
  paymentMethodIds: string[]
  dateRangeError: string | null
  loading: boolean
  exporting: boolean
  report: PaymentMethodReportResponse | null
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onPaymentMethodsChange: (ids: string[]) => void
  onGenerate: () => void
  onExport: (format: "excel" | "pdf") => void
  canExport?: boolean
}

export function ReportsPaymentMethodsTab({
  paymentMethods,
  catalogsLoading,
  from,
  to,
  paymentMethodIds,
  dateRangeError,
  loading,
  exporting,
  report,
  onFromChange,
  onToChange,
  onPaymentMethodsChange,
  onGenerate,
  onExport,
  canExport,
}: ReportsPaymentMethodsTabProps) {
  const { t } = useLanguage()
  const hasData = report && report.paymentMethods.length > 0
  const allSelected = paymentMethodIds.length === 0

  const toggleMethod = (id: string) => {
    if (paymentMethodIds.includes(id)) {
      onPaymentMethodsChange(paymentMethodIds.filter((x) => x !== id))
    } else {
      onPaymentMethodsChange([...paymentMethodIds, id])
    }
  }

  const selectAll = () => onPaymentMethodsChange([])

  // Build trigger label
  let triggerLabel = t("reports.paymentMethodsAll")
  if (paymentMethodIds.length === 1) {
    const pm = paymentMethods.find((m) => m.id === paymentMethodIds[0])
    triggerLabel = pm ? pm.name : t("reports.selectedOne")
  } else if (paymentMethodIds.length > 1) {
    triggerLabel = t("reports.selectedMany", { count: paymentMethodIds.length })
  }

  return (
    <TabsContent value="payment-methods" className="flex flex-col gap-6 mt-4">
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
          <Label className="text-xs text-muted-foreground">{t("reports.paymentMethodsLabel")}</Label>
          {catalogsLoading ? (
            <Skeleton className="h-8 w-64 rounded-md" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-64 justify-between font-normal">
                  <span className="truncate">{triggerLabel}</span>
                  <ChevronDownIcon className="size-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuCheckboxItem
                  checked={allSelected}
                  onCheckedChange={selectAll}
                  onSelect={(e) => e.preventDefault()}
                >
                  {t("reports.paymentMethodsAllLabel")}
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {paymentMethods.map((pm) => (
                  <DropdownMenuCheckboxItem
                    key={pm.id}
                    checked={allSelected || paymentMethodIds.includes(pm.id)}
                    onCheckedChange={() => toggleMethod(pm.id)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span>{pm.name}</span>
                        <Badge variant="secondary" className="text-[9px] font-mono px-1 py-0">
                          {pm.currency}
                        </Badge>
                      </div>
                      {pm.partner && (
                        <span className="text-[10px] text-muted-foreground">
                          {pm.partner.name}
                        </span>
                      )}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </ReportFilters>

      {loading ? (
        <ReportSkeleton />
      ) : report ? (
        hasData ? (
          <PaymentMethodReportResults report={report} />
        ) : (
          <ReportNoData />
        )
      ) : (
        <ReportEmptyPrompt />
      )}
    </TabsContent>
  )
}
