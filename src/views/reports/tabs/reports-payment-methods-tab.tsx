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
import { PaymentMethodReportResults } from "@/components/reports/payment-method-report-results"
import { ReportEmptyPrompt, ReportNoData, ReportSkeleton } from "@/components/reports/report-states"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { PaymentMethodReportResponse } from "@/types/report"

interface ReportsPaymentMethodsTabProps {
  paymentMethods: PaymentMethodResponse[]
  from: string
  to: string
  paymentMethodId: string
  dateRangeError: string | null
  loading: boolean
  exporting: boolean
  report: PaymentMethodReportResponse | null
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onPaymentMethodChange: (value: string) => void
  onGenerate: () => void
  onExport: (format: "excel" | "pdf") => void
}

export function ReportsPaymentMethodsTab({
  paymentMethods,
  from,
  to,
  paymentMethodId,
  dateRangeError,
  loading,
  exporting,
  report,
  onFromChange,
  onToChange,
  onPaymentMethodChange,
  onGenerate,
  onExport,
}: ReportsPaymentMethodsTabProps) {
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
      >
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Metodo de pago</Label>
          <Select
            value={paymentMethodId || "all"}
            onValueChange={onPaymentMethodChange}
          >
            <SelectTrigger size="sm" className="w-52">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {paymentMethods.map((paymentMethod) => (
                <SelectItem key={paymentMethod.id} value={paymentMethod.id}>
                  {paymentMethod.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ReportFilters>

      {loading ? (
        <ReportSkeleton />
      ) : report ? (
        report.grandTotalExpenseCount === 0 && (report.grandTotalIncomeCount ?? 0) === 0 ? (
          <ReportNoData />
        ) : (
          <PaymentMethodReportResults report={report} />
        )
      ) : (
        <ReportEmptyPrompt />
      )}
    </TabsContent>
  )
}
