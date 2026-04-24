"use client"

import { useState, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useLanguage } from "@/context/language-context"
import {
  bulkImportSchema,
  type BulkImportFormValues,
  type BulkImportItemFormValues,
} from "@/lib/validations/bulk-import"
import { parseClipboardData, BULK_IMPORT_MAX_ITEMS, type ParseResult } from "@/lib/bulk-import-utils"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { BulkExpenseItem } from "@/types/expense"
import type { BulkIncomeItem } from "@/types/income"
import {
  useBulkImportExpenseItemProcessor,
  useBulkImportIncomeItemProcessor,
} from "@/hooks/forms/use-bulk-import-item-processors"

export type BulkImportMode = "expenses" | "incomes"

import type { ProjectPartnerResponse } from "@/types/project-partner"
import type { ObligationResponse } from "@/types/obligation"

interface UseBulkImportFormOptions {
  mode: BulkImportMode
  projectCurrency: string
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  alternativeCurrencyCodes?: string[]
  partnersEnabled?: boolean
  assignedPartners?: ProjectPartnerResponse[]
  obligations?: ObligationResponse[]
  onSubmitExpenses?: (data: { items: BulkExpenseItem[] }) => Promise<void>
  onSubmitIncomes?: (data: { items: BulkIncomeItem[] }) => Promise<void>
  onClose: () => void
}

function createEmptyRow(
  projectCurrency: string,
  alternativeCurrencyCodes: string[] = [],
  assignedPartners: ProjectPartnerResponse[] = [],
): BulkImportItemFormValues {
  return {
    title: "",
    originalAmount: "",
    originalCurrency: projectCurrency,
    date: "",
    categoryId: "",
    paymentMethodId: "",
    exchangeRate: "1",
    convertedAmount: "",
    accountAmount: "",
    description: "",
    notes: "",
    obligationId: "",
    obligationEquivalentAmount: "",
    currencyExchanges: alternativeCurrencyCodes.map((code) => ({
      currencyCode: code,
      exchangeRate: "1",
      convertedAmount: "",
    })),
    splitType: "percentage",
    splits: assignedPartners.map((p) => ({
      partnerId: p.partnerId,
      partnerName: p.partnerName,
      splitValue: "",
      currencyExchanges: alternativeCurrencyCodes.map((code) => ({
        currencyCode: code,
        exchangeRate: "1",
        convertedAmount: "",
      })),
    })),
  }
}

export function useBulkImportForm({
  mode,
  projectCurrency,
  categories,
  paymentMethods,
  alternativeCurrencyCodes = [],
  partnersEnabled = false,
  assignedPartners = [],
  obligations = [],
  onSubmitExpenses,
  onSubmitIncomes,
  onClose,
}: UseBulkImportFormOptions) {
  const { t } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const processExpenseItem = useBulkImportExpenseItemProcessor()
  const processIncomeItem = useBulkImportIncomeItemProcessor({
    paymentMethods,
    projectCurrency,
  })

  const form = useForm<BulkImportFormValues>({
    resolver: zodResolver(bulkImportSchema(t)),
    defaultValues: {
      items: [],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // ── Paste handler ────────────────────────────────────────────

  const handlePaste = useCallback(
    (clipboardText: string) => {
      const result = parseClipboardData(clipboardText)
      setParseResult(result)

      if (result.error) {
        return
      }

      const newItems: BulkImportItemFormValues[] = result.rows.map((row) => ({
        ...createEmptyRow(projectCurrency || "", alternativeCurrencyCodes, assignedPartners),
        title: row.title,
        originalAmount: row.amount !== null ? String(row.amount) : "",
        date: row.date,
        description: row.description,
        originalCurrency: projectCurrency || "",
      }))

      replace(newItems)
    },
    [replace, projectCurrency, alternativeCurrencyCodes, assignedPartners],
  )

  // ── Row management ───────────────────────────────────────────

  const addRow = useCallback(() => {
    if (fields.length >= BULK_IMPORT_MAX_ITEMS) return
    append(createEmptyRow(projectCurrency, alternativeCurrencyCodes, assignedPartners))
  }, [fields.length, append, projectCurrency, alternativeCurrencyCodes, assignedPartners])

  const removeRow = useCallback(
    (index: number) => {
      remove(index)
    },
    [remove],
  )

  const clearAll = useCallback(() => {
    replace([])
    setParseResult(null)
  }, [replace])

  // ── Bulk field application ───────────────────────────────────

  const applyToAll = useCallback(
    (field: keyof BulkImportItemFormValues, value: string) => {
      const items = form.getValues("items")
      items.forEach((_, index) => {
        form.setValue(`items.${index}.${field}` as `items.${number}.${string & keyof BulkImportItemFormValues}`, value)
      })
    },
    [form],
  )

  const applyToEmpty = useCallback(
    (field: keyof BulkImportItemFormValues, value: string) => {
      const items = form.getValues("items")
      items.forEach((item, index) => {
        const currentVal = item[field]
        if (!currentVal || (typeof currentVal === "string" && currentVal.trim() === "")) {
          form.setValue(`items.${index}.${field}` as `items.${number}.${string & keyof BulkImportItemFormValues}`, value)
        }
      })
    },
    [form],
  )

  const onSubmit = useCallback(
    async (values: BulkImportFormValues) => {
      setSubmitting(true)
      try {
        if (mode === "expenses") {
          const items = values.items.map((value) => processExpenseItem(value))
          if (onSubmitExpenses) {
            await onSubmitExpenses({ items: items as BulkExpenseItem[] })
          }
        } else {
          const items: BulkIncomeItem[] = []

          for (let index = 0; index < values.items.length; index += 1) {
            const result = processIncomeItem(values.items[index])
            if (result.error) {
              form.setError(`items.${index}.${result.error.field}`, {
                type: "manual",
                message: t(result.error.messageKey),
              })
              toast.error(t(result.error.messageKey))
              return
            }
            items.push(result.item as BulkIncomeItem)
          }

          if (onSubmitIncomes) {
            await onSubmitIncomes({ items })
          }
        }

        form.reset()
        setParseResult(null)
        onClose()
      } finally {
        setSubmitting(false)
      }
    },
    [
      form,
      mode,
      onClose,
      onSubmitExpenses,
      onSubmitIncomes,
      processExpenseItem,
      processIncomeItem,
      t,
    ],
  )

   
  const onInvalid = useCallback(
    (errors: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const itemErrors = errors.items as Record<number, any> | undefined
      if (!itemErrors) {
        toast.error(t("bulkImport.errors.import"))
        return
      }

      const allItems = form.getValues("items")
      const splitsRequiredRows: number[] = []
      const splitCERows: number[] = []
      const generalRows: number[] = []

      allItems.forEach((_, idx) => {
        const rowErr = itemErrors[idx]
        if (!rowErr) return

        // Splits required: splits array has a root-level message error
        const splitsRootMsg = typeof rowErr.splits?.message === "string"
        // Splits CE missing: nested per-index CE errors
        const hasSplitCEErr =
          !!rowErr.splits &&
          !splitsRootMsg &&
          Object.values(rowErr.splits as Record<string, unknown>).some(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (s: any) => s?.currencyExchanges,
          )

        if (splitsRootMsg) {
          splitsRequiredRows.push(idx + 1)
        } else if (hasSplitCEErr) {
          splitCERows.push(idx + 1)
        } else {
          generalRows.push(idx + 1)
        }
      })

      if (splitsRequiredRows.length > 0) {
        toast.error(t("bulkImport.validation.splitsRequiredInRows", { rows: splitsRequiredRows.join(", ") }))
      }
      if (splitCERows.length > 0) {
        toast.error(t("bulkImport.validation.splitCEMissingInRows", { rows: splitCERows.join(", ") }))
      }
      if (generalRows.length > 0) {
        toast.error(t("bulkImport.validation.rowsWithErrors", { rows: generalRows.join(", ") }))
      }
      if (splitsRequiredRows.length === 0 && splitCERows.length === 0 && generalRows.length === 0) {
        toast.error(t("bulkImport.errors.import"))
      }
    },
    [t, form],
  )

  const handleClose = useCallback(() => {
    form.reset()
    setParseResult(null)
    onClose()
  }, [form, onClose])

  return {
    form,
    fields,
    submitting,
    parseResult,
    alternativeCurrencyCodes,
    partnersEnabled,
    assignedPartners,
    obligations,
    addRow,
    removeRow,
    clearAll,
    handlePaste,
    applyToAll,
    applyToEmpty,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit: form.handleSubmit(onSubmit, onInvalid as any),
    handleClose,
    canAddMore: fields.length < BULK_IMPORT_MAX_ITEMS,
    itemCount: fields.length,
    maxItems: BULK_IMPORT_MAX_ITEMS,
  }
}
