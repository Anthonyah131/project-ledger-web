"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormModal } from "@/components/shared/form-modal"
import { ISO_CURRENCIES } from "@/types/project"
import type { PaymentMethodType, CreatePaymentMethodRequest } from "@/types/payment-method"
import { useCreatePaymentMethodForm } from "@/hooks/forms/use-payment-method-form"
import { useLanguage } from "@/context/language-context"

interface CreatePaymentMethodModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreatePaymentMethodRequest) => void
}

export function CreatePaymentMethodModal({
  open,
  onClose,
  onCreate,
}: CreatePaymentMethodModalProps) {
  const { form, onSubmit, handleClose, watchType } =
    useCreatePaymentMethodForm({ onCreate, onClose })
  const { t } = useLanguage()

  const formTypeLabels: Record<PaymentMethodType, string> = {
    bank: t("paymentMethods.formTypeBank"),
    card: t("paymentMethods.typeCard"),
    cash: t("paymentMethods.typeCash"),
  }

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("paymentMethods.createTitle")}
      description={t("paymentMethods.createSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("common.create")}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.name")}</FormLabel>
            <FormControl>
              <Input placeholder={t("paymentMethods.namePlaceholder")} autoFocus {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.type")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.keys(formTypeLabels) as PaymentMethodType[]).map((typeKey) => (
                    <SelectItem key={typeKey} value={typeKey}>
                      {formTypeLabels[typeKey]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.currency")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
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

      {watchType !== "cash" && (
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {watchType === "card" ? t("paymentMethods.issuerLabel") : t("paymentMethods.bankLabel")}
                  <span className="text-muted-foreground ml-1">{t("common.optional")}</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={watchType === "card" ? t("paymentMethods.issuerPlaceholder") : t("paymentMethods.bankPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {watchType === "card" ? t("paymentMethods.lastFourLabel") : t("paymentMethods.accountNumberLabel")}
                  <span className="text-muted-foreground ml-1">{t("common.optional")}</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={watchType === "card" ? t("paymentMethods.lastFourPlaceholder") : t("paymentMethods.accountNumberPlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("common.description")}
              <span className="text-muted-foreground ml-1">{t("common.optional")}</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("paymentMethods.notesPlaceholder")}
                rows={2}
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
