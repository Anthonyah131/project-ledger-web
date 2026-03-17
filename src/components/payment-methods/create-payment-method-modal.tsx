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
import { PAYMENT_METHOD_FORM_TYPE_LABEL } from "@/lib/constants"
import { ISO_CURRENCIES } from "@/types/project"
import type { PaymentMethodType, CreatePaymentMethodRequest } from "@/types/payment-method"
import { useCreatePaymentMethodForm } from "@/hooks/forms/use-payment-method-form"

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

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Nuevo metodo de pago"
      description="Agrega una cuenta bancaria, tarjeta o efectivo."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Crear"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Cuenta BAC Principal" autoFocus {...field} />
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
              <FormLabel>Tipo</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.keys(PAYMENT_METHOD_FORM_TYPE_LABEL) as PaymentMethodType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {PAYMENT_METHOD_FORM_TYPE_LABEL[t]}
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
              <FormLabel>Moneda</FormLabel>
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
                  {watchType === "card" ? "Emisor" : "Banco"}
                  <span className="text-muted-foreground ml-1">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={watchType === "card" ? "Visa / Mastercard..." : "BAC Credomatic..."}
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
                  {watchType === "card" ? "Ultimos 4 digitos" : "N. cuenta"}
                  <span className="text-muted-foreground ml-1">(opcional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={watchType === "card" ? "4321" : "001-123456-7"}
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
              Descripcion
              <span className="text-muted-foreground ml-1">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Notas adicionales..."
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
