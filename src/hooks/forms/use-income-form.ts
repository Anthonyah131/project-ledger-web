"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLanguage } from "@/context/language-context"
import {
  createIncomeSchema,
  updateIncomeSchema,
  type CreateIncomeFormValues,
  type UpdateIncomeFormValues,
} from "@/lib/validations/income"
import type {
  IncomeResponse,
  CreateIncomeRequest,
  UpdateIncomeRequest,
} from "@/types/income"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"

type CurrencyExchangeLike = {
  currencyCode: string
  exchangeRate: number
  convertedAmount: number
}

function areCurrencyExchangesEqual(
  left: CurrencyExchangeLike[],
  right: CurrencyExchangeLike[]
) {
  if (left.length !== right.length) return false
  return left.every((item, index) => {
    const target = right[index]
    if (!target) return false
    return (
      item.currencyCode === target.currencyCode &&
      item.exchangeRate === target.exchangeRate &&
      item.convertedAmount === target.convertedAmount
    )
  })
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

interface UseCreateIncomeFormOptions {
  onCreate: (data: CreateIncomeRequest) => void
  onClose: () => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  projectCurrency: string
  sourceIncome?: IncomeResponse
}

export function useCreateIncomeForm({
  onCreate,
  onClose,
  categories,
  paymentMethods,
  projectCurrency,
  sourceIncome,
}: UseCreateIncomeFormOptions) {
  const { t } = useLanguage()
  const defaultCategoryId =
    categories.find((c) => c.isDefault)?.id || categories[0]?.id || ""
  const defaultPaymentMethodId = paymentMethods[0]?.id || ""

  const form = useForm<CreateIncomeFormValues>({
    resolver: zodResolver(createIncomeSchema(t)),
    defaultValues: sourceIncome
      ? {
          title: sourceIncome.title,
          originalAmount: String(sourceIncome.originalAmount),
          originalCurrency: sourceIncome.originalCurrency,
          incomeDate: "",
          categoryId: sourceIncome.categoryId,
          paymentMethodId: sourceIncome.paymentMethodId,
          exchangeRate: String(sourceIncome.exchangeRate),
          convertedAmount: String(sourceIncome.convertedAmount),
          description: sourceIncome.description ?? "",
          notes: sourceIncome.notes ?? "",
          receiptNumber: "",
          isActive: true,
          currencyExchanges: (sourceIncome.currencyExchanges ?? []).map((ce) => ({
            currencyCode: ce.currencyCode,
            exchangeRate: String(ce.exchangeRate),
            convertedAmount: String(ce.convertedAmount),
          })),
          accountAmount: "",
          splitType: sourceIncome.splits?.[0]?.splitType ?? "percentage",
          splits: (sourceIncome.splits ?? []).map((s) => ({
            partnerId: s.partnerId,
            partnerName: s.partnerName,
            splitValue: String(s.splitValue),
            currencyExchanges: [],
          })),
        }
      : {
          title: "",
          originalAmount: "",
          originalCurrency: normalizeCurrencyCode(projectCurrency) || "CRC",
          incomeDate: "",
          categoryId: defaultCategoryId,
          paymentMethodId: defaultPaymentMethodId,
          exchangeRate: "1",
          convertedAmount: "",
          description: "",
          notes: "",
          receiptNumber: "",
          isActive: true,
          currencyExchanges: [],
          accountAmount: "",
          splitType: "percentage",
          splits: [],
        },
  })

  const watchCurrency = useWatch({ control: form.control, name: "originalCurrency" })
  const watchAmount = useWatch({ control: form.control, name: "originalAmount" })
  const watchExchangeRate = useWatch({ control: form.control, name: "exchangeRate" })
  const watchConvertedAmount = useWatch({ control: form.control, name: "convertedAmount" })

  function onSubmit(values: CreateIncomeFormValues) {
    const selectedPaymentMethod = paymentMethods.find(
      (paymentMethod) => paymentMethod.id === values.paymentMethodId
    )

    if (!selectedPaymentMethod) {
      form.setError("paymentMethodId", {
        type: "manual",
        message: t("incomes.fields.paymentMethod.required"),
      })
      return
    }

    const normalizedProjectCurrency = normalizeCurrencyCode(projectCurrency)
    const normalizedOriginalCurrency = normalizeCurrencyCode(values.originalCurrency)
    const accountCurrency = normalizeCurrencyCode(selectedPaymentMethod.currency)
    const manualAccountAmountRequired = requiresManualAccountAmount({
      accountCurrency,
      originalCurrency: normalizedOriginalCurrency,
      projectCurrency: normalizedProjectCurrency,
    })
    const parsedAccountAmount = parsePositiveAmount(values.accountAmount)

    form.clearErrors("accountAmount")

    if (values.accountAmount.trim().length > 0 && !parsedAccountAmount) {
      form.setError("accountAmount", {
        type: "manual",
        message: t("incomes.fields.accountAmount.mustBePositive"),
      })
      return
    }

    if (manualAccountAmountRequired && !parsedAccountAmount) {
      form.setError("accountAmount", {
        type: "manual",
        message: t("incomes.fields.accountAmount.required"),
      })
      return
    }

    const amount = Number(values.originalAmount)
    const effectiveRate = parseFloat((Number(values.exchangeRate) || 1).toFixed(6))
    const convertedAmount = Number(values.convertedAmount)
    const finalConvertedAmount =
      Number.isFinite(convertedAmount) && convertedAmount > 0
        ? convertedAmount
        : parseFloat((amount * effectiveRate).toFixed(2))

    const data: CreateIncomeRequest = {
      title: values.title,
      originalAmount: amount,
      originalCurrency: normalizedOriginalCurrency,
      incomeDate: values.incomeDate,
      categoryId: values.categoryId,
      paymentMethodId: values.paymentMethodId,
      exchangeRate: effectiveRate,
      convertedAmount: finalConvertedAmount,
      isActive: values.isActive,
      accountAmount: manualAccountAmountRequired
        ? parsedAccountAmount
        : (parsedAccountAmount ?? undefined),
    }

    const currencyExchanges = values.currencyExchanges
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
          item.convertedAmount > 0
      )

    if (values.description) data.description = values.description
    if (values.notes) data.notes = values.notes
    if (values.receiptNumber) data.receiptNumber = values.receiptNumber
    if (currencyExchanges.length > 0) data.currencyExchanges = currencyExchanges

    const splitType = (values.splitType ?? "percentage") as "percentage" | "fixed"
    const splits = (values.splits ?? [])
      .filter((s) => Number(s.splitValue) > 0)
      .map((s) => {
        const splitValue = Number(s.splitValue)
        const resolvedAmount =
          splitType === "percentage"
            ? parseFloat((finalConvertedAmount * splitValue / 100).toFixed(2))
            : splitValue
        const entry: import("@/types/expense").SplitInput = { partnerId: s.partnerId, splitType, splitValue, resolvedAmount }
        const formCEs = (s.currencyExchanges ?? []).filter(
          (ce) => ce.currencyCode && Number(ce.exchangeRate) > 0 && Number(ce.convertedAmount) > 0
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
                ? (ce.convertedAmount * splitValue / 100).toFixed(4)
                : finalConvertedAmount > 0 ? (ce.convertedAmount * splitValue / finalConvertedAmount).toFixed(4) : "0"
            ),
          }))
        }
        return entry
      })
    if (splits.length > 0) data.splits = splits

    onCreate(data)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleClose,
    watchCurrency,
    watchAmount,
    watchExchangeRate,
    watchConvertedAmount,
  }
}

interface UseUpdateIncomeFormOptions {
  income: IncomeResponse | null
  onSave: (id: string, data: UpdateIncomeRequest) => void
  onClose: () => void
  paymentMethods: PaymentMethodResponse[]
  projectCurrency: string
}

export function useUpdateIncomeForm({
  income,
  onSave,
  onClose,
  paymentMethods,
  projectCurrency,
}: UseUpdateIncomeFormOptions) {
  const { t } = useLanguage()
  const form = useForm<UpdateIncomeFormValues>({
    resolver: zodResolver(updateIncomeSchema(t)),
    defaultValues: {
      isActive: true,
      currencyExchanges: [],
      accountAmount: "",
      splitType: "percentage",
      splits: [],
    },
    values: income
      ? {
          title: income.title,
          originalAmount: String(income.originalAmount),
          originalCurrency: income.originalCurrency,
          incomeDate: income.incomeDate,
          categoryId: income.categoryId,
          paymentMethodId: income.paymentMethodId,
          exchangeRate: String(income.exchangeRate),
          convertedAmount: String(income.convertedAmount),
          description: income.description ?? "",
          notes: income.notes ?? "",
          receiptNumber: income.receiptNumber ?? "",
          isActive: income.isActive,
          accountAmount: income.accountAmount != null ? String(income.accountAmount) : "",
          currencyExchanges: (income.currencyExchanges ?? []).map((item) => ({
            currencyCode: item.currencyCode,
            exchangeRate: String(item.exchangeRate),
            convertedAmount: String(item.convertedAmount),
          })),
          splitType: income.splits?.[0]?.splitType ?? "percentage",
          splits: (income.splits ?? []).map((s) => ({
            partnerId: s.partnerId,
            partnerName: s.partnerName,
            splitValue: String(s.splitValue),
            currencyExchanges: (s.currencyExchanges ?? []).map((ce) => ({
              currencyCode: ce.currencyCode,
              exchangeRate: String(ce.exchangeRate),
              convertedAmount: String(ce.convertedAmount),
            })),
          })),
        }
      : undefined,
  })

  const watchCurrency = useWatch({ control: form.control, name: "originalCurrency" })
  const watchAmount = useWatch({ control: form.control, name: "originalAmount" })
  const watchExchangeRate = useWatch({ control: form.control, name: "exchangeRate" })
  const watchConvertedAmount = useWatch({ control: form.control, name: "convertedAmount" })

  function onSubmit(values: UpdateIncomeFormValues) {
    if (!income) return

    const selectedPaymentMethod = paymentMethods.find(
      (paymentMethod) => paymentMethod.id === values.paymentMethodId
    )

    if (!selectedPaymentMethod) {
      form.setError("paymentMethodId", {
        type: "manual",
        message: t("incomes.fields.paymentMethod.required"),
      })
      return
    }

    const normalizedProjectCurrency = normalizeCurrencyCode(projectCurrency)
    const normalizedOriginalCurrency = normalizeCurrencyCode(values.originalCurrency)
    const accountCurrency = normalizeCurrencyCode(selectedPaymentMethod.currency)
    const manualAccountAmountRequired = requiresManualAccountAmount({
      accountCurrency,
      originalCurrency: normalizedOriginalCurrency,
      projectCurrency: normalizedProjectCurrency,
    })
    const parsedAccountAmount = parsePositiveAmount(values.accountAmount)

    form.clearErrors("accountAmount")

    if (values.accountAmount.trim().length > 0 && !parsedAccountAmount) {
      form.setError("accountAmount", {
        type: "manual",
        message: t("incomes.fields.accountAmount.mustBePositive"),
      })
      return
    }

    if (manualAccountAmountRequired && !parsedAccountAmount) {
      form.setError("accountAmount", {
        type: "manual",
        message: t("incomes.fields.accountAmount.required"),
      })
      return
    }

    const amount = Number(values.originalAmount)
    const effectiveRate = parseFloat((Number(values.exchangeRate) || 1).toFixed(6))
    const convertedAmount = Number(values.convertedAmount)
    const finalConvertedAmount =
      Number.isFinite(convertedAmount) && convertedAmount > 0
        ? convertedAmount
        : parseFloat((amount * effectiveRate).toFixed(2))

    const data: UpdateIncomeRequest = {
      title: values.title,
      originalAmount: amount,
      originalCurrency: normalizedOriginalCurrency,
      incomeDate: values.incomeDate,
      categoryId: values.categoryId,
      paymentMethodId: values.paymentMethodId,
      exchangeRate: effectiveRate,
      convertedAmount: finalConvertedAmount,
      accountAmount: manualAccountAmountRequired
        ? parsedAccountAmount
        : (parsedAccountAmount ?? undefined),
      isActive: values.isActive,
      description: values.description.trim().length > 0 ? values.description : null,
      notes: values.notes.trim().length > 0 ? values.notes : null,
      receiptNumber: values.receiptNumber.trim().length > 0 ? values.receiptNumber : null,
    }

    const currencyExchanges = values.currencyExchanges
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
          item.convertedAmount > 0
      )

    const existingCurrencyExchanges = (income.currencyExchanges ?? []).map((item) => ({
      currencyCode: item.currencyCode,
      exchangeRate: item.exchangeRate,
      convertedAmount: item.convertedAmount,
    }))
    data.currencyExchanges = areCurrencyExchangesEqual(
      currencyExchanges,
      existingCurrencyExchanges,
    )
      ? null
      : currencyExchanges

    const splitType = (values.splitType ?? "percentage") as "percentage" | "fixed"
    const splits = (values.splits ?? [])
      .filter((s) => Number(s.splitValue) > 0)
      .map((s) => {
        const splitValue = Number(s.splitValue)
        const resolvedAmount =
          splitType === "percentage"
            ? parseFloat((finalConvertedAmount * splitValue / 100).toFixed(2))
            : splitValue
        const entry: import("@/types/expense").SplitInput = { partnerId: s.partnerId, splitType, splitValue, resolvedAmount }
        const formCEs = (s.currencyExchanges ?? []).filter(
          (ce) => ce.currencyCode && Number(ce.exchangeRate) > 0 && Number(ce.convertedAmount) > 0
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
                ? (ce.convertedAmount * splitValue / 100).toFixed(4)
                : finalConvertedAmount > 0 ? (ce.convertedAmount * splitValue / finalConvertedAmount).toFixed(4) : "0"
            ),
          }))
        }
        return entry
      })
    if (splits.length > 0) data.splits = splits

    onSave(income.id, data)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleClose,
    watchCurrency,
    watchAmount,
    watchExchangeRate,
    watchConvertedAmount,
  }
}
