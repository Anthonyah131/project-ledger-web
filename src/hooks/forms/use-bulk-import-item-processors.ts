"use client"

import { useCallback } from "react"
import type { BulkImportItemFormValues } from "@/lib/validations/bulk-import"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { BulkExpenseItem, CurrencyExchangeRequest, SplitInput } from "@/types/expense"
import type { BulkIncomeItem } from "@/types/income"

type BulkBaseValues = {
  amount: number
  effectiveRate: number
  finalConvertedAmount: number
  normalizedOriginalCurrency: string
  currencyExchanges: CurrencyExchangeRequest[]
  splits: SplitInput[]
}

export type IncomeItemValidationError = {
  field: "paymentMethodId" | "accountAmount"
  messageKey: string
}

function normalizeCurrencyCode(value: string | null | undefined): string {
  return value?.trim().toUpperCase() ?? ""
}

function parsePositiveAmount(value: string): number | undefined {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined
  return parsed
}

function requiresManualAccountAmount(params: {
  accountCurrency: string
  originalCurrency: string
  projectCurrency: string
}): boolean {
  return (
    params.accountCurrency.length > 0 &&
    params.accountCurrency !== params.originalCurrency &&
    params.accountCurrency !== params.projectCurrency
  )
}

function buildBaseValues(values: BulkImportItemFormValues): BulkBaseValues {
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

  return {
    amount,
    effectiveRate,
    finalConvertedAmount,
    normalizedOriginalCurrency: normalizeCurrencyCode(values.originalCurrency),
    currencyExchanges,
    splits,
  }
}

export function useBulkImportExpenseItemProcessor() {
  return useCallback((values: BulkImportItemFormValues): BulkExpenseItem => {
    const {
      amount,
      effectiveRate,
      finalConvertedAmount,
      normalizedOriginalCurrency,
      currencyExchanges,
      splits,
    } = buildBaseValues(values)

    const item: BulkExpenseItem = {
      title: values.title,
      originalAmount: amount,
      originalCurrency: normalizedOriginalCurrency,
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

    if (values.obligationId?.trim()) {
      item.obligationId = values.obligationId.trim()
      const equivAmt = Number(values.obligationEquivalentAmount)
      if (Number.isFinite(equivAmt) && equivAmt > 0) {
        item.obligationEquivalentAmount = equivAmt
      }
    }

    return item
  }, [])
}

export function useBulkImportIncomeItemProcessor(params: {
  paymentMethods: PaymentMethodResponse[]
  projectCurrency: string
}) {
  const normalizedProjectCurrency = normalizeCurrencyCode(params.projectCurrency)

  return useCallback(
    (
      values: BulkImportItemFormValues,
    ): { item?: BulkIncomeItem; error?: IncomeItemValidationError } => {
      const {
        amount,
        effectiveRate,
        finalConvertedAmount,
        normalizedOriginalCurrency,
        currencyExchanges,
        splits,
      } = buildBaseValues(values)

      const selectedPaymentMethod = params.paymentMethods.find(
        (paymentMethod) => paymentMethod.id === values.paymentMethodId,
      )

      if (!selectedPaymentMethod) {
        return {
          error: {
            field: "paymentMethodId",
            messageKey: "incomes.fields.paymentMethod.required",
          },
        }
      }

      const accountCurrency = normalizeCurrencyCode(selectedPaymentMethod.currency)
      const manualAccountAmountRequired = requiresManualAccountAmount({
        accountCurrency,
        originalCurrency: normalizedOriginalCurrency,
        projectCurrency: normalizedProjectCurrency,
      })
      const parsedAccountAmount = parsePositiveAmount(values.accountAmount)

      if (values.accountAmount.trim().length > 0 && !parsedAccountAmount) {
        return {
          error: {
            field: "accountAmount",
            messageKey: "incomes.fields.accountAmount.mustBePositive",
          },
        }
      }

      if (manualAccountAmountRequired && !parsedAccountAmount) {
        return {
          error: {
            field: "accountAmount",
            messageKey: "incomes.fields.accountAmount.required",
          },
        }
      }

      const item: BulkIncomeItem = {
        title: values.title,
        originalAmount: amount,
        originalCurrency: normalizedOriginalCurrency,
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

      if (manualAccountAmountRequired) {
        item.accountAmount = parsedAccountAmount ?? null
      } else if (parsedAccountAmount) {
        item.accountAmount = parsedAccountAmount
      }

      return { item }
    },
    [normalizedProjectCurrency, params.paymentMethods],
  )
}