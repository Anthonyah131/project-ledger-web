"use client"

import { useCallback } from "react"
import { FormModal } from "@/components/shared/form-modal"
import { IncomeFormFields } from "./income-form-fields"
import { DocumentExtractionStep } from "@/components/project-detail/shared/document-extraction/document-extraction-step"
import { DocumentExtractionFeedback } from "@/components/project-detail/shared/document-extraction/document-extraction-feedback"
import type {
  CreateIncomeRequest,
  IncomeDocumentKind,
} from "@/types/income"
import type { CategoryResponse } from "@/types/category"
import type { CurrencyResponse } from "@/types/currency"
import type { PaymentMethodResponse } from "@/types/payment-method"
import { useCreateIncomeForm } from "@/hooks/forms/use-income-form"
import { useIncomeDocumentExtraction } from "@/hooks/forms/use-income-document-extraction"

interface CreateIncomeModalProps {
  projectId: string
  mode?: "manual" | "ai"
  open: boolean
  onClose: () => void
  onCreate: (data: CreateIncomeRequest) => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  availableCurrencies: CurrencyResponse[]
  projectCurrency: string
  alternativeCurrencyCodes?: string[]
}

export function CreateIncomeModal({
  projectId,
  mode = "manual",
  open,
  onClose,
  onCreate,
  categories,
  paymentMethods,
  availableCurrencies,
  projectCurrency,
  alternativeCurrencyCodes,
}: CreateIncomeModalProps) {
  const {
    form,
    onSubmit,
    handleClose,
    watchCurrency,
    watchAmount,
    watchExchangeRate,
    watchConvertedAmount,
  } =
    useCreateIncomeForm({
      onCreate,
      onClose,
      categories,
      paymentMethods,
      projectCurrency,
    })

  const isAiMode = mode === "ai"
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
  } = useIncomeDocumentExtraction({
    projectId,
    isAiMode,
    open,
    form,
    categories,
    paymentMethods,
    projectCurrency,
  })

  const handleModalClose = useCallback(() => {
    resetExtractionState()
    handleClose()
  }, [handleClose, resetExtractionState])

  return (
    <FormModal
      open={open}
      onClose={handleModalClose}
      title={isAiMode ? "Nuevo ingreso con IA" : "Nuevo ingreso"}
      description={
        isAiMode
          ? "Sube el documento y luego revisa el borrador antes de guardar el ingreso."
          : "Registra un nuevo ingreso en el proyecto."
      }
      form={form}
      onSubmit={onSubmit}
      submitLabel="Crear ingreso"
      submitHidden={isAiMode && !showFormStep}
      contentClassName="sm:max-w-2xl max-h-[88vh] overflow-y-auto"
    >
      {isAiMode && !showFormStep && (
        <DocumentExtractionStep
          title="Extraer borrador con IA"
          description="Sube una foto o PDF del recibo/factura para prellenar el formulario del ingreso."
          quota={quota}
          quotaLoading={quotaLoading}
          quotaError={quotaError}
          documentKind={documentKind}
          onDocumentKindChange={(value) => setDocumentKind(value as IncomeDocumentKind)}
          onFileChange={handleFileChange}
          extracting={extracting}
          onExtract={handleExtract}
          extractionDisabled={quota != null && !quota.isAvailable}
          extractMeta={extractMeta}
        />
      )}

      <DocumentExtractionFeedback warnings={extractWarnings} error={extractError} />

      {showFormStep && (
        <IncomeFormFields
          form={form}
          categories={categories}
          paymentMethods={paymentMethods}
          availableCurrencies={availableCurrencies}
          projectCurrency={projectCurrency}
          watchCurrency={watchCurrency}
          watchAmount={watchAmount}
          watchExchangeRate={watchExchangeRate}
          watchConvertedAmount={watchConvertedAmount}
          alternativeCurrencyCodes={alternativeCurrencyCodes}
          showPlaceholders
        />
      )}
    </FormModal>
  )
}
