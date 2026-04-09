"use client"

import { memo, useCallback, useMemo, useRef, useState } from "react"
import { GitBranch } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { cn } from "@/lib/utils"
import { getAccentColor } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import { Badge } from "@/components/ui/badge"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import type { IncomeResponse } from "@/types/income"
import type { PaymentMethodResponse } from "@/types/payment-method"
import { buildPaymentMethodLookup } from "@/lib/payment-method-utils"
import { hasMultiPartnerSplits } from "@/lib/split-utils"

interface IncomesListProps {
  incomes: IncomeResponse[]
  projectCurrency: string
  paymentMethods: PaymentMethodResponse[]
  onEdit: (income: IncomeResponse) => void
  onDelete: (income: IncomeResponse) => void
  onToggleActive: (income: IncomeResponse, isActive: boolean) => void | Promise<void>
  onView?: (income: IncomeResponse) => void
  onDuplicate?: (income: IncomeResponse) => void
}

function IncomesListComponent({
  incomes,
  projectCurrency,
  paymentMethods,
  onEdit,
  onDelete,
  onToggleActive,
  onView,
  onDuplicate,
}: IncomesListProps) {
  const { t } = useLanguage()
  const activatingIdsRef = useRef<Set<string>>(new Set())
  const [activatingIds, setActivatingIds] = useState<Set<string>>(() => new Set())

  const paymentMethodInfoById = useMemo(
    () => buildPaymentMethodLookup(paymentMethods),
    [paymentMethods]
  )

  const handleActivate = useCallback(
    async (income: IncomeResponse) => {
      if (income.isActive || activatingIdsRef.current.has(income.id)) {
        return
      }

      activatingIdsRef.current.add(income.id)
      setActivatingIds((prev) => new Set(prev).add(income.id))

      try {
        await Promise.resolve(onToggleActive(income, true))
      } finally {
        activatingIdsRef.current.delete(income.id)
        setActivatingIds((prev) => {
          const next = new Set(prev)
          next.delete(income.id)
          return next
        })
      }
    },
    [onToggleActive]
  )

  return (
    <div role="list" aria-label={t("incomes.listAriaLabel")} className="min-w-0">
      {/* Header - Desktop */}
      <div className="hidden sm:flex items-center gap-x-4 px-5 py-2.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
        <span className="flex-1">{t("incomes.colTitle")}</span>
        <span className="w-28 text-right">{t("common.date")}</span>
        <span className="w-44 text-right hidden md:block">{t("common.amount")}</span>
        <span className="w-44 text-right hidden xl:block">{t("incomes.colConversions")}</span>
        <span className="w-40 text-right hidden lg:block">{t("incomes.paymentMethodLabel")}</span>
        <span className="w-36 text-right hidden xl:block">{t("expenses.categoryLabel")}</span>
        <span className="w-8" />
      </div>

      {/* Header - Mobile */}
      <div className="flex sm:hidden items-center justify-between px-4 py-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
        <span>{t("incomes.colTitle")}</span>
        <span>{t("common.amount")}</span>
      </div>

      {incomes.map((income, i) => {
        const isActivating = activatingIds.has(income.id)
        const showOriginal = income.originalCurrency !== projectCurrency
        const exchanges = income.currencyExchanges ?? []
        const pmInfo = paymentMethodInfoById.get(income.paymentMethodId)
        const showSplitBadge = hasMultiPartnerSplits(income.splits)

        return (
          <div
            key={income.id}
            role="listitem"
            className={cn(
              "group border-b border-border/50 last:border-b-0",
              "hover:bg-emerald-500/5 transition-colors duration-150",
              onView && "cursor-pointer",
            )}
            onClick={onView ? () => onView(income) : undefined}
          >
            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center gap-x-4 px-5 py-3.5">
              <div className={cn("size-2.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-card", getAccentColor(i))} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate leading-snug">
                  {income.title}
                </p>
                {(!income.isActive || showSplitBadge) ? (
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {!income.isActive ? (
                      <Badge
                        variant="outline"
                        className="border-amber-600/50 bg-amber-500/25 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200"
                      >
                        {t("incomes.statusReminderBadge")}
                      </Badge>
                    ) : null}
                    {showSplitBadge ? (
                      <Badge
                        variant="outline"
                        className="border-violet-500/40 bg-violet-500/10 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300 gap-1"
                      >
                        <GitBranch className="size-2.5" />
                        Split
                      </Badge>
                    ) : null}
                  </div>
                ) : null}
                {income.description ? (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {income.description}
                  </p>
                ) : null}
              </div>

              <span className="w-28 text-right text-xs text-muted-foreground tabular-nums">
                {formatDate(income.incomeDate, { fixTimezone: true })}
              </span>

              <div className="w-44 text-right hidden md:block">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {projectCurrency} {formatAmount(income.convertedAmount)}
                </p>
                {showOriginal && (
                  <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                    {income.originalCurrency} {formatAmount(income.originalAmount)}
                  </p>
                )}
              </div>

              <div className="w-44 text-right hidden xl:block">
                {exchanges.length > 0 ? (
                  <div className="flex flex-col items-end gap-0.5">
                    {exchanges.slice(0, 2).map((exchange) => (
                      <p key={exchange.id} className="text-xs text-muted-foreground tabular-nums">
                        {exchange.currencyCode} {formatAmount(exchange.convertedAmount)}
                      </p>
                    ))}
                    {exchanges.length > 2 && (
                      <p className="text-[10px] text-muted-foreground/70">+{exchanges.length - 2} {t("incomes.moreExchanges")}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/30">—</span>
                )}
              </div>

              <div className="w-40 text-right hidden lg:block">
                <p className="text-xs text-muted-foreground truncate">{pmInfo?.name ?? "—"}</p>
                {pmInfo && (
                  <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                    {pmInfo.currency}{pmInfo.partnerName ? ` · ${pmInfo.partnerName}` : ""}
                  </p>
                )}
              </div>

              <span className="w-36 text-right text-xs text-muted-foreground hidden xl:block truncate">
                {income.categoryName}
              </span>

              <ItemActionMenu
                ariaLabel={t("incomes.actionMenuAria")}
                onOpen={onView ? () => onView(income) : undefined}
                openLabel={t("incomes.viewDetail")}
                onActivate={!income.isActive ? () => { void handleActivate(income) } : undefined}
                activateLabel={t("incomes.activateLabel")}
                activatingLabel={t("common.activating")}
                isActivating={isActivating}
                disabled={isActivating}
                onDuplicate={onDuplicate ? () => onDuplicate(income) : undefined}
                duplicateLabel={t("incomes.duplicate")}
                onEdit={() => onEdit(income)}
                onDelete={() => onDelete(income)}
                stopPropagation
              />
            </div>

            {/* Mobile Layout */}
            <div className="flex sm:hidden items-start gap-3 px-4 py-3">
              {/* Accent dot */}
              <div className={cn("size-2 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-card mt-1.5", getAccentColor(i))} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate leading-snug">
                      {income.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                      <span className="tabular-nums">{formatDate(income.incomeDate, { fixTimezone: true })}</span>
                      {income.categoryName && (
                        <>
                          <span className="text-border">·</span>
                          <span className="truncate">{income.categoryName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {projectCurrency} {formatAmount(income.convertedAmount)}
                    </p>
                    {showOriginal && (
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        {income.originalCurrency} {formatAmount(income.originalAmount)}
                      </p>
                    )}
                  </div>
                </div>
                {/* Badges and Description */}
                {(!income.isActive || showSplitBadge || income.description || pmInfo) && (
                  <div className="mt-1.5 space-y-1">
                    {(!income.isActive || showSplitBadge) && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!income.isActive && (
                          <Badge
                            variant="outline"
                            className="border-amber-600/50 bg-amber-500/25 text-[9px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200 h-5"
                          >
                            {t("incomes.statusReminderBadge")}
                          </Badge>
                        )}
                        {showSplitBadge && (
                          <Badge
                            variant="outline"
                            className="border-violet-500/40 bg-violet-500/10 text-[9px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300 gap-1 h-5"
                          >
                            <GitBranch className="size-2" />
                            Split
                          </Badge>
                        )}
                      </div>
                    )}
                    {pmInfo && (
                      <p className="text-[11px] text-muted-foreground/70 truncate">
                        {pmInfo.name}{pmInfo.partnerName ? ` · ${pmInfo.partnerName}` : ""}
                      </p>
                    )}
                    {income.description && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {income.description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Menu */}
              <ItemActionMenu
                ariaLabel={t("incomes.actionMenuAria")}
                onOpen={onView ? () => onView(income) : undefined}
                openLabel={t("incomes.viewDetail")}
                onActivate={!income.isActive ? () => { void handleActivate(income) } : undefined}
                activateLabel={t("incomes.activateLabel")}
                activatingLabel={t("common.activating")}
                isActivating={isActivating}
                disabled={isActivating}
                onDuplicate={onDuplicate ? () => onDuplicate(income) : undefined}
                duplicateLabel={t("incomes.duplicate")}
                onEdit={() => onEdit(income)}
                onDelete={() => onDelete(income)}
                stopPropagation
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const IncomesList = memo(IncomesListComponent)
