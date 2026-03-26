"use client"

import { useCallback, useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import * as expenseService from "@/services/expense-service"
import { useLanguage } from "@/context/language-context"
import {
  getDocumentExtractionErrorMessage,
  getDocumentValidationError,
} from "@/lib/document-extraction-utils"
import type { CreateExpenseFormValues } from "@/lib/validations/expense"
import type {
  ExpenseDocumentKind,
  ExtractExpenseFromImageResponse,
  OcrExtractionQuotaResponse,
} from "@/types/expense"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ObligationResponse } from "@/types/obligation"

interface UseExpenseDocumentExtractionOptions {
  projectId: string
  isAiMode: boolean
  open: boolean
  form: UseFormReturn<CreateExpenseFormValues>
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  obligations: ObligationResponse[]
}

interface ExpenseExtractionMeta {
  provider: string
  modelId: string
  documentKind: ExpenseDocumentKind
}

export function useExpenseDocumentExtraction({
  projectId,
  isAiMode,
  open,
  form,
  categories,
  paymentMethods,
  obligations,
}: UseExpenseDocumentExtractionOptions) {
  const { t } = useLanguage()
  const [showFormStep, setShowFormStep] = useState(!isAiMode)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [documentKind, setDocumentKind] = useState<ExpenseDocumentKind>("receipt")
  const [extracting, setExtracting] = useState(false)
  const [extractWarnings, setExtractWarnings] = useState<string[]>([])
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extractMeta, setExtractMeta] = useState<ExpenseExtractionMeta | null>(null)
  const [quota, setQuota] = useState<OcrExtractionQuotaResponse | null>(null)
  const [quotaLoading, setQuotaLoading] = useState(false)
  const [quotaError, setQuotaError] = useState<string | null>(null)

  const applyExtractionToForm = useCallback((result: ExtractExpenseFromImageResponse) => {
    const { draft } = result

    if (draft.notes) {
      form.setValue("notes", draft.notes, { shouldValidate: true })
    }
    if (typeof draft.isActive === "boolean") {
      form.setValue("isActive", draft.isActive, { shouldValidate: true })
    }
    if (draft.obligationId && obligations.some((obligation) => obligation.id === draft.obligationId)) {
      form.setValue("obligationId", draft.obligationId, { shouldValidate: true })
    }
    if (
      typeof draft.obligationEquivalentAmount === "number" &&
      Number.isFinite(draft.obligationEquivalentAmount) &&
      draft.obligationEquivalentAmount > 0
    ) {
      form.setValue("obligationEquivalentAmount", String(draft.obligationEquivalentAmount), {
        shouldValidate: true,
      })
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

    if (draft.title) {
      form.setValue("title", draft.title, { shouldValidate: true })
    }
    if (draft.description) {
      form.setValue("description", draft.description, { shouldValidate: true })
    }
    if (draft.receiptNumber) {
      form.setValue("receiptNumber", draft.receiptNumber, { shouldValidate: true })
    }
    if (typeof draft.originalAmount === "number" && Number.isFinite(draft.originalAmount) && draft.originalAmount > 0) {
      form.setValue("originalAmount", String(draft.originalAmount), { shouldValidate: true })
    }
    if (typeof draft.exchangeRate === "number" && Number.isFinite(draft.exchangeRate) && draft.exchangeRate > 0) {
      form.setValue("exchangeRate", String(draft.exchangeRate), { shouldValidate: true })
    }
    if (typeof draft.convertedAmount === "number" && Number.isFinite(draft.convertedAmount) && draft.convertedAmount > 0) {
      form.setValue("convertedAmount", String(draft.convertedAmount), { shouldValidate: true })
    }
    if (draft.expenseDate) {
      form.setValue("expenseDate", draft.expenseDate.slice(0, 10), { shouldValidate: true })
    }

    const suggestedCategoryId = result.suggestedCategory?.categoryId
    const fallbackCategoryId = result.availableCategories.find((category) => category.isDefault)?.categoryId
    const selectedCategoryId = [draft.categoryId, suggestedCategoryId, fallbackCategoryId]
      .filter((value): value is string => Boolean(value))
      .find((categoryId) => categories.some((category) => category.id === categoryId))

    if (selectedCategoryId) {
      form.setValue("categoryId", selectedCategoryId, { shouldValidate: true })
    }

    const suggestedPaymentMethodId = result.suggestedPaymentMethod?.paymentMethodId
    const extractedCurrency = draft.originalCurrency?.toUpperCase() ?? null
    const paymentMethodByCurrency = extractedCurrency
      ? paymentMethods.find((paymentMethod) => paymentMethod.currency.toUpperCase() === extractedCurrency)?.id
      : undefined
    const selectedPaymentMethodId = [draft.paymentMethodId, suggestedPaymentMethodId, paymentMethodByCurrency]
      .filter((value): value is string => Boolean(value))
      .find((paymentMethodId) => paymentMethods.some((paymentMethod) => paymentMethod.id === paymentMethodId))

    if (selectedPaymentMethodId) {
      form.setValue("paymentMethodId", selectedPaymentMethodId, { shouldValidate: true })
    }

    setExtractWarnings(result.warnings ?? [])
    setExtractMeta({
      provider: result.provider,
      modelId: result.modelId,
      documentKind: result.documentKind,
    })
  }, [categories, form, obligations, paymentMethods])

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
      const result = await expenseService.getExpenseExtractionQuota(projectId)
      setQuota(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : t("expenses.ocrQuotaError")
      setQuotaError(message)
    } finally {
      setQuotaLoading(false)
    }
  }, [isAiMode, projectId, t])

  const handleExtract = useCallback(async () => {
    const validationError = getDocumentValidationError(uploadFile, t)
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
      const result = await expenseService.extractExpenseFromImage(projectId, {
        file: uploadFile,
        documentKind,
      })

      applyExtractionToForm(result)
      setShowFormStep(true)
      toast.success(t("expenses.draftExtracted"), {
        description: t("expenses.draftExtractedDesc"),
      })
    } catch (err) {
      setExtractError(getDocumentExtractionErrorMessage(err, t))
    } finally {
      setExtracting(false)
    }
  }, [applyExtractionToForm, documentKind, projectId, t, uploadFile])

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
