"use client"

import { useCallback, useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import * as incomeService from "@/services/income-service"
import {
  getDocumentExtractionErrorMessage,
  getDocumentValidationError,
} from "@/lib/document-extraction-utils"
import type { CreateIncomeFormValues } from "@/lib/validations/income"
import type {
  ExtractIncomeFromImageResponse,
  IncomeDocumentKind,
  IncomeExtractionQuotaResponse,
} from "@/types/income"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"

interface UseIncomeDocumentExtractionOptions {
  projectId: string
  isAiMode: boolean
  open: boolean
  form: UseFormReturn<CreateIncomeFormValues>
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  projectCurrency: string
}

interface IncomeExtractionMeta {
  provider: string
  modelId: string
  documentKind: IncomeDocumentKind
}

export function useIncomeDocumentExtraction({
  projectId,
  isAiMode,
  open,
  form,
  categories,
  paymentMethods,
  projectCurrency,
}: UseIncomeDocumentExtractionOptions) {
  const [showFormStep, setShowFormStep] = useState(!isAiMode)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [documentKind, setDocumentKind] = useState<IncomeDocumentKind>("receipt")
  const [extracting, setExtracting] = useState(false)
  const [extractWarnings, setExtractWarnings] = useState<string[]>([])
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extractMeta, setExtractMeta] = useState<IncomeExtractionMeta | null>(null)
  const [quota, setQuota] = useState<IncomeExtractionQuotaResponse | null>(null)
  const [quotaLoading, setQuotaLoading] = useState(false)
  const [quotaError, setQuotaError] = useState<string | null>(null)

  const applyExtractionToForm = useCallback((result: ExtractIncomeFromImageResponse) => {
    const { draft } = result

    if (draft.title) {
      form.setValue("title", draft.title, { shouldValidate: true })
    }
    if (draft.description) {
      form.setValue("description", draft.description, { shouldValidate: true })
    }
    if (draft.notes) {
      form.setValue("notes", draft.notes, { shouldValidate: true })
    }
    if (typeof draft.isActive === "boolean") {
      form.setValue("isActive", draft.isActive, { shouldValidate: true })
    }
    if (draft.receiptNumber) {
      form.setValue("receiptNumber", draft.receiptNumber, { shouldValidate: true })
    }
    if (
      typeof draft.originalAmount === "number" &&
      Number.isFinite(draft.originalAmount) &&
      draft.originalAmount > 0
    ) {
      form.setValue("originalAmount", String(draft.originalAmount), { shouldValidate: true })
    }
    if (draft.originalCurrency) {
      form.setValue("originalCurrency", draft.originalCurrency.toUpperCase(), {
        shouldValidate: true,
      })
    }
    if (typeof draft.exchangeRate === "number" && Number.isFinite(draft.exchangeRate) && draft.exchangeRate > 0) {
      form.setValue("exchangeRate", String(draft.exchangeRate), { shouldValidate: true })
    }
    if (
      typeof draft.convertedAmount === "number" &&
      Number.isFinite(draft.convertedAmount) &&
      draft.convertedAmount > 0
    ) {
      form.setValue("convertedAmount", String(draft.convertedAmount), { shouldValidate: true })
    }
    if (typeof draft.accountAmount === "number" && Number.isFinite(draft.accountAmount) && draft.accountAmount > 0) {
      form.setValue("accountAmount", String(draft.accountAmount), { shouldValidate: true })
      form.clearErrors("accountAmount")
    }
    if (draft.incomeDate) {
      form.setValue("incomeDate", draft.incomeDate.slice(0, 10), { shouldValidate: true })
    }
    if (Array.isArray(draft.currencyExchanges)) {
      form.setValue(
        "currencyExchanges",
        draft.currencyExchanges.map((item) => ({
          currencyCode: item.currencyCode,
          exchangeRate: String(item.exchangeRate),
          convertedAmount: String(item.convertedAmount),
        })),
        { shouldValidate: true },
      )
    }

    const fallbackCategoryId = categories.find((category) => category.isDefault)?.id
    const selectedCategoryId = [draft.categoryId, fallbackCategoryId]
      .filter((value): value is string => Boolean(value))
      .find((categoryId) => categories.some((category) => category.id === categoryId))

    if (selectedCategoryId) {
      form.setValue("categoryId", selectedCategoryId, { shouldValidate: true })
    }

    const extractedCurrency = draft.originalCurrency?.toUpperCase() ?? null
    const accountCurrency = draft.accountCurrency?.toUpperCase() ?? null
    const paymentMethodByAccountCurrency = accountCurrency
      ? paymentMethods.find((paymentMethod) => paymentMethod.currency.toUpperCase() === accountCurrency)?.id
      : undefined
    const paymentMethodByCurrency = extractedCurrency
      ? paymentMethods.find((paymentMethod) => paymentMethod.currency.toUpperCase() === extractedCurrency)?.id
      : undefined
    const selectedPaymentMethodId = [
      draft.paymentMethodId,
      paymentMethodByAccountCurrency,
      paymentMethodByCurrency,
    ]
      .filter((value): value is string => Boolean(value))
      .find((paymentMethodId) => paymentMethods.some((paymentMethod) => paymentMethod.id === paymentMethodId))

    if (selectedPaymentMethodId) {
      form.setValue("paymentMethodId", selectedPaymentMethodId, { shouldValidate: true })
    }

    const selectedPaymentMethodCurrency = selectedPaymentMethodId
      ? paymentMethods.find((paymentMethod) => paymentMethod.id === selectedPaymentMethodId)?.currency.toUpperCase()
      : undefined
    const effectiveAccountCurrency = selectedPaymentMethodCurrency ?? accountCurrency
    const effectiveOriginalCurrency =
      (draft.originalCurrency ?? form.getValues("originalCurrency") ?? "").toUpperCase()
    const normalizedProjectCurrency = projectCurrency.toUpperCase()
    const requiresManualAccountAmount =
      Boolean(effectiveAccountCurrency) &&
      effectiveAccountCurrency !== effectiveOriginalCurrency &&
      effectiveAccountCurrency !== normalizedProjectCurrency

    if (requiresManualAccountAmount && !(typeof draft.accountAmount === "number" && draft.accountAmount > 0)) {
      const message = "Account amount is required for selected account currency."
      form.setError("accountAmount", { type: "manual", message })
      toast.warning("Monto de cuenta requerido", { description: message })
    }

    setExtractWarnings(result.warnings ?? [])
    setExtractMeta({
      provider: result.provider,
      modelId: result.modelId,
      documentKind: result.documentKind,
    })
  }, [categories, form, paymentMethods, projectCurrency])

  const resetExtractionState = useCallback(() => {
    setShowFormStep(!isAiMode)
    setUploadFile(null)
    setDocumentKind("receipt")
    setExtracting(false)
    setExtractWarnings([])
    setExtractError(null)
    setExtractMeta(null)
    setQuota(null)
    setQuotaLoading(false)
    setQuotaError(null)
  }, [isAiMode])

  const loadQuota = useCallback(async () => {
    if (!isAiMode) return

    setQuotaLoading(true)
    setQuotaError(null)
    try {
      const result = await incomeService.getIncomeExtractionQuota(projectId)
      setQuota(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar la cuota OCR"
      setQuotaError(message)
    } finally {
      setQuotaLoading(false)
    }
  }, [isAiMode, projectId])

  const handleExtract = useCallback(async () => {
    const validationError = getDocumentValidationError(uploadFile)
    if (validationError) {
      setExtractError(validationError)
      return
    }
    if (!uploadFile) {
      return
    }

    setExtracting(true)
    setExtractError(null)

    try {
      const result = await incomeService.extractIncomeFromImage(projectId, {
        file: uploadFile,
        documentKind,
      })

      applyExtractionToForm(result)
      setShowFormStep(true)
      toast.success("Borrador extraido", {
        description: "Revisa y ajusta los datos antes de crear el ingreso definitivo.",
      })
    } catch (err) {
      setExtractError(getDocumentExtractionErrorMessage(err))
    } finally {
      setExtracting(false)
    }
  }, [applyExtractionToForm, documentKind, projectId, uploadFile])

  const handleFileChange = useCallback((file: File | null) => {
    setUploadFile(file)
    setExtractError(null)
  }, [])

  useEffect(() => {
    setShowFormStep(!isAiMode)
  }, [isAiMode, open])

  useEffect(() => {
    if (open && isAiMode) {
      void loadQuota()
    }
  }, [isAiMode, loadQuota, open])

  useEffect(() => {
    if (!open) {
      resetExtractionState()
    }
  }, [open, resetExtractionState])

  return {
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
  }
}
