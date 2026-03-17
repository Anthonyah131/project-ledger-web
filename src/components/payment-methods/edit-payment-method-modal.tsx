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
import type {
  PaymentMethodResponse,
  PaymentMethodType,
  UpdatePaymentMethodRequest,
} from "@/types/payment-method"
import { useUpdatePaymentMethodForm } from "@/hooks/forms/use-payment-method-form"

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

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Editar metodo de pago"
      description={
        <>
          Modifica los datos del metodo de pago.
          {paymentMethod && (
            <span className="ml-1 font-medium text-foreground">
              La moneda ({paymentMethod.currency}) no se puede cambiar.
            </span>
          )}
        </>
      }
      form={form}
      onSubmit={onSubmit}
      submitLabel="Guardar cambios"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
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
                  {watchType === "card" ? "Ultimos 4 digitos" : "N. cuenta"}
                  <span className="text-muted-foreground ml-1">(opcional)</span>
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
              Descripcion
              <span className="text-muted-foreground ml-1">(opcional)</span>
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
