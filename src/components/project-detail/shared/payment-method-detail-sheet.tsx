"use client"

import {
  X,
  Pencil,
  CalendarDays,
  Building2,
  Banknote,
  CreditCard as CardIcon,
  Hash,
  FileText,
  Users,
} from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/date-utils"
import type { PaymentMethodResponse } from "@/types/payment-method"
import { useLanguage } from "@/context/language-context"

interface PaymentMethodDetailSheetProps {
  paymentMethod: PaymentMethodResponse | null
  onClose: () => void
  onEdit: () => void
}

const PM_TYPE_ICONS: Record<string, React.ElementType> = {
  bank: Building2,
  cash: Banknote,
  card: CardIcon,
}

export function PaymentMethodDetailSheet({
  paymentMethod,
  onClose,
  onEdit,
}: PaymentMethodDetailSheetProps) {
  const { t } = useLanguage()

  const open = !!paymentMethod
  const pm = paymentMethod

  const PM_TYPE_LABELS: Record<string, string> = {
    bank: t("pmDetail.pmTypes.bank"),
    cash: t("pmDetail.pmTypes.cash"),
    card: t("pmDetail.pmTypes.card"),
  }

  const PmTypeIcon = pm?.type ? (PM_TYPE_ICONS[pm.type] ?? CardIcon) : CardIcon

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden"
      >
        {pm && (
          <>
            <div className="shrink-0 border-b border-border/60">
              <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-blue-500" />

              <div className="px-5 pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-lg bg-sky-500/10 p-2">
                    <PmTypeIcon className="size-4 text-sky-600 dark:text-sky-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-base font-semibold leading-snug break-words">
                      {pm.name}
                    </SheetTitle>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold uppercase border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400"
                      >
                        {PM_TYPE_LABELS[pm.type] ?? pm.type}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-semibold uppercase border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        {pm.currency}
                      </Badge>
                    </div>
                  </div>

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

            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-5 px-5 py-5">

                <div className="flex flex-col gap-3">
                  {pm.bankName && (
                    <DetailRow icon={<Building2 className="size-3.5" />} label={t("pmDetail.bankName")}>
                      {pm.bankName}
                    </DetailRow>
                  )}

                  {pm.accountNumber && (
                    <DetailRow icon={<Hash className="size-3.5" />} label={t("pmDetail.accountNumber")}>
                      {pm.accountNumber}
                    </DetailRow>
                  )}

                  <DetailRow icon={<CalendarDays className="size-3.5" />} label={t("common.date")}>
                    {formatDate(pm.createdAt, { fixTimezone: true })}
                  </DetailRow>

                  {pm.partner && (
                    <DetailRow icon={<Users className="size-3.5" />} label={t("pmDetail.partner")}>
                      <div className="flex flex-col gap-1.5">
                        <span className="font-medium">{pm.partner.name}</span>
                        {pm.partner.email && (
                          <span className="text-xs text-muted-foreground">{pm.partner.email}</span>
                        )}
                      </div>
                    </DetailRow>
                  )}
                </div>

                {pm.description && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-3">
                      <DetailRow icon={<FileText className="size-3.5" />} label={t("common.description")}>
                        <span className="whitespace-pre-wrap">{pm.description}</span>
                      </DetailRow>
                    </div>
                  </>
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