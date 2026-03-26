"use client"

import {
  X,
  Pencil,
  GitBranch,
  CalendarDays,
  Tag,
  CreditCard,
  FileText,
  StickyNote,
  Hash,
  Info,
  TrendingUp,
  TrendingDown,
  Building2,
  Banknote,
  CreditCard as CardIcon,
} from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import type { ExpenseResponse } from "@/types/expense"
import type { IncomeResponse } from "@/types/income"
import type { PaymentMethodResponse } from "@/types/payment-method"
import { useLanguage } from "@/context/language-context"

type Movement =
  | { type: "expense"; data: ExpenseResponse }
  | { type: "income"; data: IncomeResponse }

interface MovementDetailSheetProps {
  movement: Movement | null
  projectCurrency: string
  paymentMethods: PaymentMethodResponse[]
  onClose: () => void
  onEdit: () => void
}

const PM_TYPE_ICONS: Record<string, React.ElementType> = {
  bank: Building2,
  cash: Banknote,
  card: CardIcon,
}

export function MovementDetailSheet({
  movement,
  projectCurrency,
  paymentMethods,
  onClose,
  onEdit,
}: MovementDetailSheetProps) {
  const { t } = useLanguage()

  const PM_TYPE_LABELS: Record<string, string> = {
    bank: t("movementDetail.pmTypes.bank"),
    cash: t("movementDetail.pmTypes.cash"),
    card: t("movementDetail.pmTypes.card"),
  }

  const open = !!movement

  const pm = movement
    ? paymentMethods.find((p) => p.id === movement.data.paymentMethodId)
    : null

  const date =
    movement?.type === "expense"
      ? movement.data.expenseDate
      : movement?.data.incomeDate ?? ""

  const data = movement?.data
  const isIncome = movement?.type === "income"

  const PmTypeIcon = pm?.type ? (PM_TYPE_ICONS[pm.type] ?? CreditCard) : CreditCard

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden"
      >
        {data && (
          <>
            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="shrink-0 border-b border-border/60">
              {/* Type accent bar */}
              <div className={`h-1 w-full ${isIncome ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-rose-500 to-pink-500"}`} />

              <div className="px-5 pt-4 pb-4">
                {/* Title row + actions */}
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`mt-0.5 shrink-0 rounded-lg p-2 ${isIncome ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                    {isIncome
                      ? <TrendingUp className={`size-4 text-emerald-600 dark:text-emerald-400`} />
                      : <TrendingDown className={`size-4 text-rose-600 dark:text-rose-400`} />
                    }
                  </div>

                  {/* Title + badges */}
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-base font-semibold leading-snug break-words">
                      {data.title}
                    </SheetTitle>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold uppercase ${isIncome ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400"}`}
                      >
                        {isIncome ? t("movementDetail.incomeLabel") : t("movementDetail.expenseLabel")}
                      </Badge>
                      {data.isActive ? (
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          {t("movementDetail.accountedLabel")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase border-amber-600/50 bg-amber-500/25 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200">
                          {t("movementDetail.reminderLabel")}
                        </Badge>
                      )}
                      {data.hasSplits && (
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 gap-1">
                          <GitBranch className="size-2.5" />
                          Split
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => { onClose(); setTimeout(onEdit, 150) }}
                    >
                      <Pencil className="size-3" />
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label={t("common.close")}
                      onClick={onClose}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Scrollable body ──────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-5 px-5 py-5">

                {/* Amounts card */}
                <div className="rounded-xl border border-border/70 bg-muted/20 overflow-hidden">
                  <div className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest ${isIncome ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/8" : "text-rose-600 dark:text-rose-400 bg-rose-500/8"}`}>
                    {t("movementDetail.amountsSection")}
                  </div>
                  <div className="px-4 pb-4 pt-3 flex flex-col gap-2.5">
                    {/* Original amount — primary */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">{t("movementDetail.originalLabel")}</span>
                      <span className={`text-xl font-bold tabular-nums ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {data.originalCurrency} {formatAmount(data.originalAmount)}
                      </span>
                    </div>

                    {/* Project currency */}
                    {data.originalCurrency !== projectCurrency && (
                      <>
                        <Separator className="opacity-50" />
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">{t("movementDetail.inCurrency", { currency: projectCurrency })}</span>
                          <span className="text-sm font-semibold tabular-nums">
                            {projectCurrency} {formatAmount(data.convertedAmount)}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Account currency (income-specific) */}
                    {"accountCurrency" in data &&
                      data.accountCurrency &&
                      data.accountCurrency !== data.originalCurrency &&
                      data.accountCurrency !== projectCurrency && (
                        <>
                          <Separator className="opacity-50" />
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-muted-foreground">{t("movementDetail.inAccount", { currency: data.accountCurrency })}</span>
                            <span className="text-sm font-semibold tabular-nums text-foreground/80">
                              {data.accountCurrency} {formatAmount((data as IncomeResponse).accountAmount)}
                            </span>
                          </div>
                        </>
                      )}

                    {/* Alternative currency exchanges */}
                    {data.currencyExchanges && data.currencyExchanges.length > 0 && (
                      <>
                        <Separator className="opacity-50" />
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t("movementDetail.altConversions")}</p>
                        {data.currencyExchanges.map((ex) => (
                          <div key={ex.id} className="flex items-baseline justify-between">
                            <span className="text-xs text-muted-foreground">{ex.currencyCode}</span>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {ex.currencyCode} {formatAmount(ex.convertedAmount)}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-3">
                  <DetailRow icon={<CalendarDays className="size-3.5" />} label={t("common.date")}>
                    {formatDate(date, { fixTimezone: true })}
                  </DetailRow>

                  <DetailRow icon={<Tag className="size-3.5" />} label={t("movementDetail.categoryLabel")}>
                    {data.categoryName ?? "—"}
                  </DetailRow>

                  <DetailRow
                    icon={<CreditCard className="size-3.5" />}
                    label={isIncome ? t("movementDetail.destinationAccount") : t("movementDetail.paymentMethodLabel")}
                  >
                    {pm ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="font-medium">{pm.name}</span>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {pm.currency}
                          </Badge>
                          {pm.type && (
                            <Badge variant="outline" className="text-[10px] font-medium text-sky-600 dark:text-sky-400 border-sky-500/40 gap-1">
                              <PmTypeIcon className="size-2.5" />
                              {PM_TYPE_LABELS[pm.type] ?? pm.type}
                            </Badge>
                          )}
                          {pm.bankName && (
                            <Badge variant="outline" className="text-[10px] font-medium text-slate-600 dark:text-slate-400 border-slate-500/40">
                              {pm.bankName}
                            </Badge>
                          )}
                          {pm.partner && (
                            <Badge variant="outline" className="text-[10px] font-medium text-violet-600 dark:text-violet-400 border-violet-500/40">
                              {pm.partner.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </DetailRow>

                  {data.receiptNumber && (
                    <DetailRow icon={<Hash className="size-3.5" />} label={t("movementDetail.receiptNumber")}>
                      {data.receiptNumber}
                    </DetailRow>
                  )}

                  {data.description && (
                    <DetailRow icon={<FileText className="size-3.5" />} label={t("common.description")}>
                      <span className="whitespace-pre-wrap">{data.description}</span>
                    </DetailRow>
                  )}

                  {data.notes && (
                    <DetailRow icon={<StickyNote className="size-3.5" />} label={t("common.notes")}>
                      <span className="whitespace-pre-wrap">{data.notes}</span>
                    </DetailRow>
                  )}
                </div>

                {/* Splits */}
                {data.splits && data.splits.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <GitBranch className="size-3.5 text-violet-500" />
                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                          {t("movementDetail.splitsSection")}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {data.splits.map((split) => (
                          <div
                            key={split.partnerId}
                            className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{split.partnerName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  {split.splitType === "percentage"
                                    ? `${split.splitValue}%`
                                    : `${projectCurrency} ${formatAmount(split.splitValue)}`}
                                </span>
                                <span className="text-sm font-semibold tabular-nums text-violet-600 dark:text-violet-400">
                                  {projectCurrency} {formatAmount(split.resolvedAmount)}
                                </span>
                              </div>
                            </div>
                            {split.currencyExchanges && split.currencyExchanges.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-violet-500/15 flex flex-col gap-1">
                                {split.currencyExchanges.map((ex) => (
                                  <div key={ex.id} className="flex items-baseline justify-between">
                                    <span className="text-[10px] text-muted-foreground/60">{ex.currencyCode}</span>
                                    <span className="text-[10px] tabular-nums text-muted-foreground/60">
                                      {ex.currencyCode} {formatAmount(ex.convertedAmount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* No splits detail available */}
                {data.hasSplits && (!data.splits || data.splits.length === 0) && (
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
                    <Info className="size-3.5 shrink-0" />
                    {t("movementDetail.splitsInfo")}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3 min-w-0">
      <div className="flex items-start gap-1.5 shrink-0 mt-0.5 text-muted-foreground w-[110px]">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-sm text-foreground flex-1 min-w-0 break-words">{children}</div>
    </div>
  )
}
