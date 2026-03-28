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
import type { SplitInput, CurrencyExchangeRequest } from "@/types/expense"

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
  alternativeCurrencyCodes: string[] = [],
  assignedPartners: ProjectPartnerResponse[] = [],
): BulkImportItemFormValues {
  return {
    title: "",
    originalAmount: "",
    originalCurrency: "",
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
        ...createEmptyRow(alternativeCurrencyCodes, assignedPartners),
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
    append(createEmptyRow(alternativeCurrencyCodes, assignedPartners))
  }, [fields.length, append, alternativeCurrencyCodes, assignedPartners])

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

  // ── Submit ───────────────────────────────────────────────────

  const processItem = useCallback(
    (values: BulkImportItemFormValues, itemMode: BulkImportMode): BulkExpenseItem | BulkIncomeItem => {
      const amount = Number(values.originalAmount)
      const effectiveRate = parseFloat((Number(values.exchangeRate) || 1).toFixed(6))
      const convertedAmount = Number(values.convertedAmount)
      const finalConvertedAmount =
        Number.isFinite(convertedAmount) && convertedAmount > 0
          ? convertedAmount
          : parseFloat((amount * effectiveRate).toFixed(2))

      const currencyExchanges: CurrencyExchangeRequest[] = (values.currencyExchanges ?? [])
        .map((item) => ({
          currencyCode: item.currencyCode.trim(),
          exchangeRate: parseFloat(Number(item.exchangeRate).toFixed(6)),
          convertedAmount: Number(item.convertedAmount),
        }))
        .filter(
          (item) =>
            item.currencyCode.length > 0 &&
            Number.isFinite(item.exchangeRate) &&
            item.exchangeRate > 0 &&
            Number.isFinite(item.convertedAmount) &&
            item.convertedAmount > 0,
        )

      const splitType = (values.splitType ?? "percentage") as "percentage" | "fixed"
      const splits: SplitInput[] = (values.splits ?? [])
        .filter((s) => Number(s.splitValue) > 0)
        .map((s) => {
          const splitValue = Number(s.splitValue)
          const resolvedAmount =
            splitType === "percentage"
              ? parseFloat(((finalConvertedAmount * splitValue) / 100).toFixed(2))
              : splitValue
          const entry: SplitInput = {
            partnerId: s.partnerId,
            splitType,
            splitValue,
            resolvedAmount,
          }
          const formCEs = (s.currencyExchanges ?? []).filter(
            (ce) =>
              ce.currencyCode &&
              Number(ce.exchangeRate) > 0 &&
              Number(ce.convertedAmount) > 0,
          )
          if (formCEs.length > 0) {
            entry.currencyExchanges = formCEs.map((ce) => ({
              currencyCode: ce.currencyCode,
              exchangeRate: Number(ce.exchangeRate),
              convertedAmount: Number(ce.convertedAmount),
            }))
          } else if (currencyExchanges.length > 0) {
            entry.currencyExchanges = currencyExchanges.map((ce) => ({
              currencyCode: ce.currencyCode,
              exchangeRate: ce.exchangeRate,
              convertedAmount: parseFloat(
                splitType === "percentage"
                  ? ((ce.convertedAmount * splitValue) / 100).toFixed(4)
                  : finalConvertedAmount > 0
                    ? ((ce.convertedAmount * splitValue) / finalConvertedAmount).toFixed(4)
                    : "0",
              ),
            }))
          }
          return entry
        })

      const item: BulkExpenseItem = {
        title: values.title,
        originalAmount: amount,
        originalCurrency: values.originalCurrency,
        date: values.date,
        categoryId: values.categoryId,
        paymentMethodId: values.paymentMethodId,
        exchangeRate: effectiveRate,
        convertedAmount: finalConvertedAmount,
      }

      if (values.description?.trim()) item.description = values.description
      if (values.notes?.trim()) item.notes = values.notes
      if (currencyExchanges.length > 0) item.currencyExchanges = currencyExchanges
      if (splits.length > 0) item.splits = splits

      // Account amount handling (for incomes or when PM currency differs)
      const accountAmountVal = Number(values.accountAmount)
      if (Number.isFinite(accountAmountVal) && accountAmountVal > 0) {
        item.accountAmount = accountAmountVal
      }

      // Obligation fields (expenses only)
      if (itemMode === "expenses" && values.obligationId?.trim()) {
        item.obligationId = values.obligationId.trim()
        const equivAmt = Number(values.obligationEquivalentAmount)
        if (Number.isFinite(equivAmt) && equivAmt > 0) {
          item.obligationEquivalentAmount = equivAmt
        }
      }

      return item
    },
    [],
  )

  const onSubmit = useCallback(
    async (values: BulkImportFormValues) => {
      setSubmitting(true)
      try {
        const items = values.items.map((v) => processItem(v, mode))

        if (mode === "expenses" && onSubmitExpenses) {
          await onSubmitExpenses({ items: items as BulkExpenseItem[] })
        } else if (mode === "incomes" && onSubmitIncomes) {
          await onSubmitIncomes({ items: items as BulkIncomeItem[] })
        }

        form.reset()
        setParseResult(null)
        onClose()
      } finally {
        setSubmitting(false)
      }
    },
    [mode, processItem, onSubmitExpenses, onSubmitIncomes, onClose, form],
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
