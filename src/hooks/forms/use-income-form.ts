"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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

interface UseCreateIncomeFormOptions {
  onCreate: (data: CreateIncomeRequest) => void
  onClose: () => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
}

export function useCreateIncomeForm({
  onCreate,
  onClose,
  categories,
  paymentMethods,
}: UseCreateIncomeFormOptions) {
  const defaultCategoryId =
    categories.find((c) => c.isDefault)?.id || categories[0]?.id || ""
  const defaultPaymentMethodId = paymentMethods[0]?.id || ""

  const form = useForm<CreateIncomeFormValues>({
    resolver: zodResolver(createIncomeSchema),
    defaultValues: {
      title: "",
      originalAmount: "",
      originalCurrency: paymentMethods[0]?.currency ?? "CRC",
      incomeDate: "",
      categoryId: defaultCategoryId,
      paymentMethodId: defaultPaymentMethodId,
      exchangeRate: "1",
      convertedAmount: "",
      description: "",
      notes: "",
      receiptNumber: "",
      currencyExchanges: [],
    },
  })

  const watchCurrency = useWatch({ control: form.control, name: "originalCurrency" })
  const watchAmount = useWatch({ control: form.control, name: "originalAmount" })
  const watchExchangeRate = useWatch({ control: form.control, name: "exchangeRate" })

  function onSubmit(values: CreateIncomeFormValues) {
    const amount = Number(values.originalAmount)
    const effectiveRate = Number(values.exchangeRate) || 1

    const data: CreateIncomeRequest = {
      title: values.title,
      originalAmount: amount,
      originalCurrency: values.originalCurrency,
      incomeDate: values.incomeDate,
      categoryId: values.categoryId,
      paymentMethodId: values.paymentMethodId,
      exchangeRate: effectiveRate,
      convertedAmount: parseFloat((amount * effectiveRate).toFixed(2)),
    }

    const currencyExchanges = values.currencyExchanges
      .map((item) => ({
        currencyCode: item.currencyCode.trim(),
        exchangeRate: Number(item.exchangeRate),
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
  }
}

interface UseUpdateIncomeFormOptions {
  income: IncomeResponse | null
  onSave: (id: string, data: UpdateIncomeRequest) => void
  onClose: () => void
}

export function useUpdateIncomeForm({ income, onSave, onClose }: UseUpdateIncomeFormOptions) {
  const form = useForm<UpdateIncomeFormValues>({
    resolver: zodResolver(updateIncomeSchema),
    defaultValues: {
      currencyExchanges: [],
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
          currencyExchanges: (income.currencyExchanges ?? []).map((item) => ({
            currencyCode: item.currencyCode,
            exchangeRate: String(item.exchangeRate),
            convertedAmount: String(item.convertedAmount),
          })),
        }
      : undefined,
  })

  const watchCurrency = useWatch({ control: form.control, name: "originalCurrency" })
  const watchAmount = useWatch({ control: form.control, name: "originalAmount" })
  const watchExchangeRate = useWatch({ control: form.control, name: "exchangeRate" })

  function onSubmit(values: UpdateIncomeFormValues) {
    if (!income) return

    const amount = Number(values.originalAmount)
    const effectiveRate = Number(values.exchangeRate) || 1

    const data: UpdateIncomeRequest = {
      title: values.title,
      originalAmount: amount,
      originalCurrency: values.originalCurrency,
      incomeDate: values.incomeDate,
      categoryId: values.categoryId,
      paymentMethodId: values.paymentMethodId,
      exchangeRate: effectiveRate,
      convertedAmount: parseFloat((amount * effectiveRate).toFixed(2)),
    }

    const currencyExchanges = values.currencyExchanges
      .map((item) => ({
        currencyCode: item.currencyCode.trim(),
        exchangeRate: Number(item.exchangeRate),
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
    data.currencyExchanges = currencyExchanges

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
  }
}
