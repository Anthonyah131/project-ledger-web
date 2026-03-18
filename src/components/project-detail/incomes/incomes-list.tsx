"use client"

import { memo, useCallback, useMemo, useRef, useState } from "react"
import { GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAccentColor } from "@/lib/constants"
import { formatDate } from "@/lib/date-utils"
import { formatAmount } from "@/lib/format-utils"
import { Badge } from "@/components/ui/badge"
import { ItemActionMenu } from "@/components/shared/item-action-menu"
import type { IncomeResponse } from "@/types/income"
import type { PaymentMethodResponse } from "@/types/payment-method"

interface IncomesListProps {
  incomes: IncomeResponse[]
  projectCurrency: string
  paymentMethods: PaymentMethodResponse[]
  onEdit: (income: IncomeResponse) => void
  onDelete: (income: IncomeResponse) => void
  onToggleActive: (income: IncomeResponse, isActive: boolean) => void | Promise<void>
}

function IncomesListComponent({
  incomes,
  projectCurrency,
  paymentMethods,
  onEdit,
  onDelete,
  onToggleActive,
}: IncomesListProps) {
  const activatingIdsRef = useRef<Set<string>>(new Set())
  const [activatingIds, setActivatingIds] = useState<Set<string>>(() => new Set())

  const paymentMethodNameById = useMemo(
    () => new Map(paymentMethods.map((pm) => [pm.id, pm.name])),
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
    <div role="list" aria-label="Lista de ingresos">
      <div className="flex items-center px-5 py-2.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
        <span className="flex-1">Titulo</span>
        <span className="w-28 text-right hidden sm:block">Fecha</span>
        <span className="w-44 text-right hidden md:block">Monto</span>
        <span className="w-44 text-right hidden xl:block">Conversiones</span>
        <span className="w-40 text-right hidden lg:block">Metodo de pago</span>
        <span className="w-36 text-right hidden xl:block">Categoria</span>
        <span className="w-8" />
      </div>

      {incomes.map((income, i) => {
        const isActivating = activatingIds.has(income.id)
        const showOriginal = income.originalCurrency !== projectCurrency
        const exchanges = income.currencyExchanges ?? []
        const pmName = paymentMethodNameById.get(income.paymentMethodId) ?? "—"

        return (
          <div
            key={income.id}
            role="listitem"
            className={cn(
              "group flex items-center px-5 py-3.5",
              "border-b border-border/50 last:border-b-0",
              "hover:bg-emerald-500/5 transition-colors duration-150"
            )}
          >
            <div className={cn("size-2.5 rounded-full shrink-0 mr-3.5 ring-2 ring-offset-1 ring-offset-card", getAccentColor(i))} />

            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-foreground truncate leading-snug">
                {income.title}
              </p>
              {(!income.isActive || income.hasSplits) ? (
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {!income.isActive ? (
                    <Badge
                      variant="outline"
                      className="border-amber-600/50 bg-amber-500/25 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200"
                    >
                      Recordatorio
                    </Badge>
                  ) : null}
                  {income.hasSplits ? (
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

            <span className="w-28 text-right text-xs text-muted-foreground tabular-nums hidden sm:block">
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
                    <p className="text-[10px] text-muted-foreground/70">+{exchanges.length - 2} mas</p>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground/30">—</span>
              )}
            </div>

            <span className="w-40 text-right text-xs text-muted-foreground hidden lg:block truncate">
              {pmName}
            </span>

            <span className="w-36 text-right text-xs text-muted-foreground hidden xl:block truncate">
              {income.categoryName}
            </span>

            <ItemActionMenu
              ariaLabel="Acciones del ingreso"
              onActivate={!income.isActive ? () => { void handleActivate(income) } : undefined}
              activateLabel="Activar movimiento"
              activatingLabel="Activando..."
              isActivating={isActivating}
              disabled={isActivating}
              onEdit={() => onEdit(income)}
              onDelete={() => onDelete(income)}
            />
          </div>
        )
      })}
    </div>
  )
}

export const IncomesList = memo(IncomesListComponent)
