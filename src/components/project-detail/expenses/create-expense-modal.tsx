"use client"

import { useCallback, useEffect } from "react"
import { useWatch } from "react-hook-form"
import { DocumentExtractionStep } from "@/components/project-detail/shared/document-extraction/document-extraction-step"
import { DocumentExtractionFeedback } from "@/components/project-detail/shared/document-extraction/document-extraction-feedback"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FormModal } from "@/components/shared/form-modal"
import { ExpenseFormFields } from "./expense-form-fields"
import { useExpenseDocumentExtraction } from "@/hooks/forms/use-expense-document-extraction"
import type { CreateExpenseRequest } from "@/types/expense"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ObligationResponse } from "@/types/obligation"
import type { ProjectPartnerResponse } from "@/types/project-partner"
import { useCreateExpenseForm } from "@/hooks/forms/use-expense-form"

interface CreateExpenseModalProps {
  projectId: string
  mode?: "manual" | "ai"
  open: boolean
  onClose: () => void
  onCreate: (data: CreateExpenseRequest) => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  obligations: ObligationResponse[]
  projectCurrency: string
  alternativeCurrencyCodes?: string[]
  partnersEnabled?: boolean
  assignedPartners?: ProjectPartnerResponse[]
}

export function CreateExpenseModal({
  projectId,
  mode = "manual",
  open,
  onClose,
  onCreate,
  categories,
  paymentMethods,
  obligations,
  projectCurrency,
  alternativeCurrencyCodes,
  partnersEnabled = false,
  assignedPartners = [],
}: CreateExpenseModalProps) {
  const {
    form,
    onSubmit,
    handleClose,
    watchCurrency,
    watchAmount,
    watchExchangeRate,
    watchConvertedAmount,
  } = useCreateExpenseForm({ onCreate, onClose, categories, paymentMethods })
  const isAiMode = mode === "ai"

  const watchObligationId = useWatch({ control: form.control, name: "obligationId" })
  const selectedObligation = obligations.find((o) => o.id === watchObligationId)
  const showEquivalentAmount = !!selectedObligation && selectedObligation.currency !== watchCurrency

  const {
    showFormStep,
    documentKind,
    setDocumentKind,
    extracting,
    extractWarnings,
    extractError,
    extractMeta,
    quota,
    quotaLoading,
    quotaError,
    handleExtract,
    handleFileChange,
    resetExtractionState,
  } = useExpenseDocumentExtraction({
    projectId,
    isAiMode,
    open,
    form,
    categories,
    paymentMethods,
    obligations,
  })

  const handleModalClose = useCallback(() => {
    resetExtractionState()
    handleClose()
  }, [handleClose, resetExtractionState])

  function handleSubmitWithEquivalentGuard(e?: React.BaseSyntheticEvent) {
    if (showEquivalentAmount && !form.getValues("obligationEquivalentAmount")) {
      e?.preventDefault()
      form.setError("obligationEquivalentAmount", {
        type: "manual",
        message: `Campo requerido para pagos en ${selectedObligation!.currency}`,
      })
      return
    }
    onSubmit(e)
  }

  useEffect(() => {
    if (!showEquivalentAmount) {
      form.setValue("obligationEquivalentAmount", "")
    }
  }, [form, showEquivalentAmount])

  return (
    <FormModal
      open={open}
      onClose={handleModalClose}
      title={isAiMode ? "Nuevo gasto con IA" : "Nuevo gasto"}
      description={
        isAiMode
          ? "Sube el documento y luego revisa el borrador antes de guardar el gasto."
          : "Registra un nuevo gasto en el proyecto."
      }
      form={form}
      onSubmit={handleSubmitWithEquivalentGuard}
      submitLabel="Crear gasto"
      submitHidden={isAiMode && !showFormStep}
      contentClassName="sm:max-w-2xl max-h-[88vh] overflow-y-auto"
    >
      {isAiMode && !showFormStep && (
        <DocumentExtractionStep
          title="Extraer borrador con IA"
          description="Sube una foto o PDF del recibo/factura para prellenar el formulario del gasto."
          quota={quota}
          quotaLoading={quotaLoading}
          quotaError={quotaError}
          documentKind={documentKind}
          onDocumentKindChange={setDocumentKind}
          onFileChange={handleFileChange}
          extracting={extracting}
          onExtract={handleExtract}
          extractionDisabled={quota != null && !quota.isAvailable}
          extractMeta={extractMeta}
        />
      )}

      <DocumentExtractionFeedback warnings={extractWarnings} error={extractError} />

      {showFormStep && (
        <>
          <ExpenseFormFields
            form={form}
            categories={categories}
            paymentMethods={paymentMethods}
            projectCurrency={projectCurrency}
            watchCurrency={watchCurrency}
            watchAmount={watchAmount}
            watchExchangeRate={watchExchangeRate}
            watchConvertedAmount={watchConvertedAmount}
            alternativeCurrencyCodes={alternativeCurrencyCodes}
            showPlaceholders
            partnersEnabled={partnersEnabled}
            assignedPartners={assignedPartners}
          />

          {obligations.length > 0 && (
            <FormField
              control={form.control}
              name="obligationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obligacion (opcional)</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Ninguna" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Ninguna</SelectItem>
                      {obligations.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {showEquivalentAmount && (
            <FormField
              control={form.control}
              name="obligationEquivalentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Equivalente en {selectedObligation!.currency}{" "}
                    <span className="font-normal text-xs text-muted-foreground">(opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={`¿Cuánto ${selectedObligation!.currency} cubre este pago?`}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Saldo pendiente: {selectedObligation!.currency}{" "}
                    {selectedObligation!.remainingAmount.toLocaleString()}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </>
      )}
    </FormModal>
  )
}
