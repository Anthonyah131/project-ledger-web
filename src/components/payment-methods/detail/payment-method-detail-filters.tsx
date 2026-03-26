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
import { useLanguage } from "@/context/language-context"

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
  const { t } = useLanguage()
  const hasFilters =
    from.length > 0 || to.length > 0 || projectId.length > 0 || activeStatus !== "active"

  return (
    <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-purple-500/3 to-transparent p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-7 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
          <Filter className="size-3.5" />
        </div>
        <p className="text-sm font-bold text-foreground">{t("paymentMethods.sharedFilters")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.3fr_1fr_auto] gap-3">
        <DateInput
          id="payment-method-from"
          name="paymentMethodFrom"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          aria-label={t("common.dateFrom")}
          max={to || undefined}
          aria-invalid={Boolean(dateRangeError)}
          autoComplete="off"
        />

        <DateInput
          id="payment-method-to"
          name="paymentMethodTo"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          aria-label={t("common.dateTo")}
          min={from || undefined}
          aria-invalid={Boolean(dateRangeError)}
          autoComplete="off"
        />

        <Select value={projectId || "all"} onValueChange={(value) => setProjectId(value === "all" ? "" : value)}>
          <SelectTrigger aria-label={t("paymentMethods.filterByProject")}>
            <SelectValue placeholder={t("paymentMethods.allProjects")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("paymentMethods.allProjects")}</SelectItem>
            {projects.items.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activeStatus} onValueChange={setActiveStatus}>
          <SelectTrigger aria-label={t("paymentMethods.filterByStatus")}>
            <SelectValue placeholder={t("paymentMethods.statusActive")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t("paymentMethods.statusActive")}</SelectItem>
            <SelectItem value="inactive">{t("paymentMethods.statusInactive")}</SelectItem>
            <SelectItem value="all">{t("common.all")}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          disabled={!hasFilters}
          className="border-violet-500/30 text-violet-700 dark:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/50 disabled:opacity-40"
        >
          <X className="size-4" />
          {t("common.clear")}
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
