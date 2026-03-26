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
import type {
  PaymentMethodResponse,
  PaymentMethodType,
  UpdatePaymentMethodRequest,
} from "@/types/payment-method"
import { useUpdatePaymentMethodForm } from "@/hooks/forms/use-payment-method-form"
import { useLanguage } from "@/context/language-context"

interface EditPaymentMethodModalProps {
  paymentMethod: PaymentMethodResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdatePaymentMethodRequest) => void
}

export function EditPaymentMethodModal({
  paymentMethod,
  open,
  onClose,
  onSave,
}: EditPaymentMethodModalProps) {
  const { form, onSubmit, handleClose, watchType } =
    useUpdatePaymentMethodForm({ paymentMethod, onSave, onClose })
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
      title={t("paymentMethods.editTitle")}
      description={
        <>
          {t("paymentMethods.editSubtitle")}
          {paymentMethod && (
            <span className="ml-1 font-medium text-foreground">
              {t("paymentMethods.currencyWarning", { currency: paymentMethod.currency })}
            </span>
          )}
        </>
      }
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("common.save")}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.name")}</FormLabel>
            <FormControl>
              <Input autoFocus {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
                  <Input {...field} />
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
                  <Input {...field} />
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
              <Textarea rows={2} className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
