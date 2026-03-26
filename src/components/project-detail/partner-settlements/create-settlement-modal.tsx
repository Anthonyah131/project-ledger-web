"use client"

import { useState } from "react"
import { useWatch } from "react-hook-form"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DateInput } from "@/components/ui/date-input"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormModal } from "@/components/shared/form-modal"
import { useLanguage } from "@/context/language-context"
import { ISO_CURRENCIES } from "@/types/project"
import { useCreateSettlementForm } from "@/hooks/forms/use-settlement-form"
import { getExchangeRate } from "@/services/exchange-rate-service"
import type { CreateSettlementRequest } from "@/types/partner-settlement"
import type { ProjectPartnerResponse } from "@/types/project-partner"

interface CreateSettlementModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateSettlementRequest) => void
  assignedPartners: ProjectPartnerResponse[]
  projectCurrency: string
  alternativeCurrencyCodes: string[]
  /** Pre-fills the create settlement form with this suggestion */
  prefill?: { fromPartnerId: string; toPartnerId: string; amount: string }
}

export function CreateSettlementModal({
  open,
  onClose,
  onCreate,
  assignedPartners,
  projectCurrency,
  alternativeCurrencyCodes,
  prefill,
}: CreateSettlementModalProps) {
  const { t } = useLanguage()
  const { form, fields, onSubmit, handleClose } = useCreateSettlementForm({
    projectCurrency,
    alternativeCurrencyCodes,
    prefill,
    onCreate,
    onClose,
  })

  const watchedCurrency = useWatch({ control: form.control, name: "currency" })
  const watchedAmount = useWatch({ control: form.control, name: "amount" })
  const watchedExchangeRate = useWatch({ control: form.control, name: "exchangeRate" })
  const isBaseCurrency = watchedCurrency === projectCurrency

  // Base-currency amount used by exchange rows to compute converted amounts
  const baseAmount =
    Number(watchedAmount) > 0 && Number(watchedExchangeRate) > 0
      ? Number(watchedAmount) * Number(watchedExchangeRate)
      : 0

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("partnerSettlements.createTitle")}
      description={t("partnerSettlements.createSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("partnerSettlements.create")}
      contentClassName="sm:max-w-sm max-h-[90vh] overflow-y-auto"
    >
      {/* From partner */}
      <FormField
        control={form.control}
        name="fromPartnerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("partnerSettlements.payerLabel")} {t("common.required")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("partnerSettlements.selectPartner")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {assignedPartners.map((p) => (
                  <SelectItem key={p.partnerId} value={p.partnerId}>
                    {p.partnerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* To partner */}
      <FormField
        control={form.control}
        name="toPartnerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("partnerSettlements.receiverLabel")} {t("common.required")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("partnerSettlements.selectPartner")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {assignedPartners.map((p) => (
                  <SelectItem key={p.partnerId} value={p.partnerId}>
                    {p.partnerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Amount + currency */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.amount")} {t("common.required")}</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="0.00" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.currency")} {t("common.required")}</FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v)
                  if (v === projectCurrency) form.setValue("exchangeRate", "1")
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ISO_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Exchange rate (only when non-base currency) */}
      {!isBaseCurrency && (
        <FormField
          control={form.control}
          name="exchangeRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("partnerSettlements.exchangeRateLabel", { currency: projectCurrency })} {t("common.required")}</FormLabel>
              <FormControl>
                <Input type="number" step="0.000001" min="0" placeholder="1.000000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Date */}
      <FormField
        control={form.control}
        name="settlementDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.date")} {t("common.required")}</FormLabel>
            <FormControl>
              <DateInput {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.description")}</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Saldo cuenta lote" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.notes")}</FormLabel>
            <FormControl>
              <Textarea rows={2} className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Alternative currency exchanges */}
      {fields.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t("partnerSettlements.alternativeCurrencies")}
          </p>
          {fields.map((f, index) => (
            <SettlementCurrencyExchangeRow
              key={f.id}
              form={form}
              index={index}
              projectCurrency={projectCurrency}
              baseAmount={baseAmount}
            />
          ))}
        </div>
      )}
    </FormModal>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface SettlementCurrencyExchangeRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  index: number
  projectCurrency: string
  baseAmount: number
}

function SettlementCurrencyExchangeRow({
  form,
  index,
  projectCurrency,
  baseAmount,
}: SettlementCurrencyExchangeRowProps) {
  const { t } = useLanguage()
  const [autoRateLoading, setAutoRateLoading] = useState(false)

  const currencyCode = useWatch({
    control: form.control,
    name: `currencyExchanges.${index}.currencyCode`,
  }) as string

  async function handleAutoRate() {
    if (!currencyCode) return
    if (baseAmount <= 0) {
      toast.warning(t("partnerSettlements.enterValidAmountForConversion"))
      return
    }
    setAutoRateLoading(true)
    try {
      const response = await getExchangeRate({ from: projectCurrency, to: currencyCode, amount: baseAmount })
      form.setValue(`currencyExchanges.${index}.exchangeRate`, String(response.rate), { shouldValidate: true })
      form.setValue(`currencyExchanges.${index}.convertedAmount`, String(response.convertedAmount), { shouldValidate: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("partnerSettlements.noRateError")
      toast.error(t("partnerSettlements.rateErrorTitle"), { description: msg })
    } finally {
      setAutoRateLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-border/60 bg-background p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">→ {currencyCode}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleAutoRate}
          disabled={autoRateLoading || baseAmount <= 0}
        >
          {autoRateLoading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
          {t("common.auto")}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name={`currencyExchanges.${index}.exchangeRate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">
                {t("partnerSettlements.rateLabel", { from: projectCurrency, to: currencyCode })}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.000001"
                  min="0"
                  placeholder="0.000000"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    const rate = Number(e.target.value)
                    if (rate > 0 && baseAmount > 0) {
                      form.setValue(
                        `currencyExchanges.${index}.convertedAmount`,
                        (baseAmount * rate).toFixed(4),
                        { shouldValidate: true },
                      )
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`currencyExchanges.${index}.convertedAmount`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">{t("partnerSettlements.amountLabel", { currency: currencyCode })}</FormLabel>
              <FormControl>
                <Input type="number" step="0.0001" min="0" placeholder="0.0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
