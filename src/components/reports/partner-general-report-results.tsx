"use client"

// components/reports/partner-general-report-results.tsx
// Renders JSON results for the partner general report (consolidated across projects).

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  ChevronDown,
  CreditCard,
  FolderKanban,
  Scale,
} from "lucide-react"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type {
  PartnerGeneralReportResponse,
  PartnerGeneralReportProject,
} from "@/types/report"

interface Props {
  report: PartnerGeneralReportResponse
}

export function PartnerGeneralReportResults({ report }: Props) {
  const totalProjects = report.projects.length
  const totalTransactions = report.projects.reduce(
    (sum, p) => sum + p.transactions.length,
    0,
  )
  const totalSettlements = report.projects.reduce(
    (sum, p) => sum + p.settlements.length,
    0,
  )

  return (
    <div className="flex flex-col gap-5">
      {/* ── Stat strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl border bg-border overflow-hidden">
        <StatCell
          label="Proyectos"
          value={String(totalProjects)}
          icon={<FolderKanban className="size-3.5" />}
        />
        <StatCell
          label="Transacciones"
          value={String(totalTransactions)}
          icon={<Banknote className="size-3.5" />}
        />
        <StatCell
          label="Settlements"
          value={String(totalSettlements)}
          icon={<Scale className="size-3.5" />}
        />
        <StatCell
          label="Periodo"
          value={
            report.dateFrom && report.dateTo
              ? `${formatDate(report.dateFrom)} – ${formatDate(report.dateTo)}`
              : "Todo"
          }
          compact
        />
      </div>

      {/* ── Per-project sections ──────────────────────────────── */}
      {report.projects.map((project) => (
        <ProjectSection key={project.projectId} project={project} />
      ))}

      {/* ── Payment methods ───────────────────────────────────── */}
      {report.paymentMethods.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-gradient-to-r from-cyan-500/5 to-transparent">
            <CreditCard className="size-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <h3 className="text-sm font-semibold text-foreground">
              Métodos de pago
            </h3>
            <span className="text-xs text-muted-foreground">
              En moneda nativa de cada método
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground bg-muted/30">
                  <th className="text-left py-2.5 pl-5 pr-3 font-medium">Método</th>
                  <th className="text-left py-2.5 px-3 font-medium">Banco</th>
                  <th className="text-left py-2.5 px-3 font-medium">Moneda</th>
                  <th className="text-right py-2.5 px-3 font-medium">Gastos</th>
                  <th className="text-right py-2.5 px-3 font-medium">Ingresos</th>
                  <th className="text-right py-2.5 px-3 font-medium">Flujo neto</th>
                  <th className="text-right py-2.5 pr-5 pl-3 font-medium">Tx</th>
                </tr>
              </thead>
              <tbody>
                {report.paymentMethods.map((pm) => (
                  <tr
                    key={pm.paymentMethodId}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-2.5 pl-5 pr-3 font-medium text-foreground">
                      {pm.paymentMethodName}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {pm.bankName || "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                        {pm.currency}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-rose-600 dark:text-rose-400">
                      {formatAmount(pm.totalExpenses)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatAmount(pm.totalIncomes)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right tabular-nums font-semibold ${
                        pm.netFlow >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {pm.currency} {formatAmount(pm.netFlow)}
                    </td>
                    <td className="py-2.5 pr-5 pl-3 text-right tabular-nums text-muted-foreground">
                      {pm.transactionCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Per-project collapsible section ─────────────────────────────────────────

function ProjectSection({ project }: { project: PartnerGeneralReportProject }) {
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">("all")
  const [detailsOpen, setDetailsOpen] = useState(true)
  const isPositive = project.netBalance >= 0

  const filteredTransactions =
    typeFilter === "all"
      ? project.transactions
      : project.transactions.filter((t) => t.type === typeFilter)

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* ── Project header ──────────────────────────────────── */}
      <button
        type="button"
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors border-b border-border"
        onClick={() => setDetailsOpen((prev) => !prev)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="size-4 text-violet-600 dark:text-violet-400 shrink-0" />
            <h3 className="text-sm font-semibold text-foreground truncate">
              {project.projectName}
            </h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono shrink-0">
              {project.currencyCode}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <NetBalancePill
            value={project.netBalance}
            currency={project.currencyCode}
          />
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-200 ${
              detailsOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {detailsOpen && (
        <div className="flex flex-col divide-y divide-border/60">
          {/* ── Balance metrics row ──────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-border/40">
            <MetricCell
              label="Pagó físicamente"
              value={formatAmount(project.paidPhysically)}
              currency={project.currencyCode}
            />
            <MetricCell
              label="Le deben otros"
              value={formatAmount(project.othersOweHim)}
              currency={project.currencyCode}
              accent="emerald"
            />
            <MetricCell
              label="Debe a otros"
              value={formatAmount(project.heOwesOthers)}
              currency={project.currencyCode}
              accent="rose"
            />
            <MetricCell
              label="Settlements pagados"
              value={formatAmount(project.settlementsPaid)}
              currency={project.currencyCode}
            />
            <MetricCell
              label="Settlements recibidos"
              value={formatAmount(project.settlementsReceived)}
              currency={project.currencyCode}
            />
          </div>

          {/* ── Transactions table ───────────────────────────── */}
          {project.transactions.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-5 py-2.5 bg-muted/20">
                <span className="text-xs font-semibold text-foreground">
                  Transacciones
                  <span className="text-muted-foreground font-normal ml-1.5">
                    {filteredTransactions.length}
                    {typeFilter !== "all" && ` de ${project.transactions.length}`}
                  </span>
                </span>
                <Select
                  value={typeFilter}
                  onValueChange={(v) => setTypeFilter(v as "all" | "expense" | "income")}
                >
                  <SelectTrigger size="sm" className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="expense">Gastos</SelectItem>
                    <SelectItem value="income">Ingresos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground bg-muted/10">
                      <th className="text-left py-2 pl-5 pr-3 font-medium">Fecha</th>
                      <th className="text-left py-2 px-3 font-medium">Tipo</th>
                      <th className="text-left py-2 px-3 font-medium">Título</th>
                      <th className="text-left py-2 px-3 font-medium hidden sm:table-cell">Categoría</th>
                      <th className="text-left py-2 px-3 font-medium hidden md:table-cell">Pagó</th>
                      <th className="text-left py-2 px-3 font-medium hidden lg:table-cell">Método</th>
                      <th className="text-right py-2 pr-5 pl-3 font-medium">Split</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr
                        key={tx.transactionId}
                        className="border-b border-border/30 last:border-0 hover:bg-muted/15 transition-colors"
                      >
                        <td className="py-2 pl-5 pr-3 tabular-nums text-muted-foreground whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-2 px-3">
                          <TypeBadge type={tx.type} />
                        </td>
                        <td className="py-2 px-3 font-medium text-foreground max-w-52 truncate">
                          {tx.title}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground hidden sm:table-cell">
                          {tx.category}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground hidden md:table-cell">
                          {tx.payingPartnerName}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground hidden lg:table-cell">
                          {tx.paymentMethodName}
                        </td>
                        <td className="py-2 pr-5 pl-3 text-right tabular-nums font-semibold whitespace-nowrap">
                          {project.currencyCode} {formatAmount(tx.splitAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Settlements table ────────────────────────────── */}
          {project.settlements.length > 0 && (
            <div>
              <div className="px-5 py-2.5 bg-muted/20">
                <span className="text-xs font-semibold text-foreground">
                  Settlements
                  <span className="text-muted-foreground font-normal ml-1.5">
                    {project.settlements.length}
                  </span>
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground bg-muted/10">
                      <th className="text-left py-2 pl-5 pr-3 font-medium">Fecha</th>
                      <th className="text-left py-2 px-3 font-medium">Dirección</th>
                      <th className="text-left py-2 px-3 font-medium">Otro partner</th>
                      <th className="text-right py-2 pr-5 pl-3 font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.settlements.map((s) => (
                      <tr
                        key={s.settlementId}
                        className="border-b border-border/30 last:border-0 hover:bg-muted/15 transition-colors"
                      >
                        <td className="py-2 pl-5 pr-3 tabular-nums text-muted-foreground whitespace-nowrap">
                          {formatDate(s.date)}
                        </td>
                        <td className="py-2 px-3">
                          <DirectionBadge direction={s.direction} />
                        </td>
                        <td className="py-2 px-3 font-medium text-foreground">
                          {s.otherPartnerName}
                        </td>
                        <td className="py-2 pr-5 pl-3 text-right tabular-nums font-semibold">
                          <div className="flex flex-col items-end gap-0.5">
                            <span>
                              {project.currencyCode} {formatAmount(s.convertedAmount)}
                            </span>
                            {s.currency !== project.currencyCode &&
                              s.convertedAmount !== s.amount && (
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  {s.currency} {formatAmount(s.amount)}
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Small primitives ────────────────────────────────────────────────────────

function StatCell({
  label,
  value,
  icon,
  compact,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  compact?: boolean
}) {
  return (
    <div className="bg-card px-4 py-3.5 flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {icon}
        {label}
      </span>
      <span
        className={`font-semibold tracking-tight leading-tight tabular-nums ${
          compact ? "text-sm" : "text-lg"
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function MetricCell({
  label,
  value,
  currency,
  accent,
}: {
  label: string
  value: string
  currency: string
  accent?: "emerald" | "rose"
}) {
  const colorClass =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "rose"
        ? "text-rose-600 dark:text-rose-400"
        : "text-foreground"

  return (
    <div className="bg-card px-4 py-3 flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={`text-xs font-semibold tabular-nums ${colorClass}`}>
        {currency} {value}
      </span>
    </div>
  )
}

function NetBalancePill({
  value,
  currency,
}: {
  value: number
  currency: string
}) {
  if (value === 0) {
    return (
      <Badge variant="outline" className="font-mono text-xs border-border text-muted-foreground">
        Saldado
      </Badge>
    )
  }

  const isPositive = value >= 0
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums ${
        isPositive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="size-3.5" />
      ) : (
        <ArrowDownRight className="size-3.5" />
      )}
      {currency} {formatAmount(Math.abs(value))}
    </span>
  )
}

function TypeBadge({ type }: { type: "expense" | "income" }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${
        type === "expense"
          ? "border-rose-500/30 text-rose-600 dark:text-rose-400"
          : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
      }`}
    >
      {type === "expense" ? "Gasto" : "Ingreso"}
    </Badge>
  )
}

function DirectionBadge({ direction }: { direction: "paid_to" | "received_from" }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${
        direction === "received_from"
          ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          : "border-rose-500/30 text-rose-600 dark:text-rose-400"
      }`}
    >
      {direction === "received_from" ? "Recibido" : "Pagado"}
    </Badge>
  )
}
