"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createExpenseSchema,
  updateExpenseSchema,
  type CreateExpenseFormValues,
  type UpdateExpenseFormValues,
} from "@/lib/validations/expense"
import type {
  ExpenseResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from "@/types/expense"
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

// ─── Create ───────────────────────────────────────────────────────────────────

interface UseCreateExpenseFormOptions {
  onCreate: (data: CreateExpenseRequest) => void
  onClose: () => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
}

export function useCreateExpenseForm({
  onCreate,
  onClose,
  categories,
  paymentMethods,
}: UseCreateExpenseFormOptions) {
  const defaultCategoryId =
    categories.find((c) => c.isDefault)?.id || categories[0]?.id || ""
  const defaultPaymentMethodId = paymentMethods[0]?.id || ""

  const form = useForm<CreateExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: "",
      originalAmount: "",
      originalCurrency: paymentMethods[0]?.currency ?? "CRC",
      expenseDate: "",
      categoryId: defaultCategoryId,
      paymentMethodId: defaultPaymentMethodId,
      exchangeRate: "1",
      convertedAmount: "",
      description: "",
      receiptNumber: "",
      notes: "",
      isActive: true,
      obligationId: "",
      obligationEquivalentAmount: "",
      currencyExchanges: [],
    },
  })

  const watchCurrency = useWatch({ control: form.control, name: "originalCurrency" })
  const watchAmount = useWatch({ control: form.control, name: "originalAmount" })
  const watchExchangeRate = useWatch({ control: form.control, name: "exchangeRate" })
  const watchConvertedAmount = useWatch({ control: form.control, name: "convertedAmount" })

  function onSubmit(values: CreateExpenseFormValues) {
    const amount = Number(values.originalAmount)
    const effectiveRate = Number(values.exchangeRate) || 1
    const convertedAmount = Number(values.convertedAmount)
    const data: CreateExpenseRequest = {
      title: values.title,
      originalAmount: amount,
      originalCurrency: values.originalCurrency,
      expenseDate: values.expenseDate,
      categoryId: values.categoryId,
      paymentMethodId: values.paymentMethodId,
      exchangeRate: effectiveRate,
      convertedAmount:
        Number.isFinite(convertedAmount) && convertedAmount > 0
          ? convertedAmount
          : parseFloat((amount * effectiveRate).toFixed(2)),
      isActive: values.isActive,
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
    if (values.receiptNumber) data.receiptNumber = values.receiptNumber
    if (values.notes) data.notes = values.notes
    if (values.obligationId && values.obligationId !== "none") {
      data.obligationId = values.obligationId
    }
    if (currencyExchanges.length > 0) data.currencyExchanges = currencyExchanges
    if (
      values.obligationId &&
      values.obligationId !== "none" &&
      values.obligationEquivalentAmount
    ) {
      data.obligationEquivalentAmount = Number(values.obligationEquivalentAmount)
    }
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

// ─── Update ───────────────────────────────────────────────────────────────────

interface UseUpdateExpenseFormOptions {
  expense: ExpenseResponse | null
  onSave: (id: string, data: UpdateExpenseRequest) => void
  onClose: () => void
}

export function useUpdateExpenseForm({ expense, onSave, onClose }: UseUpdateExpenseFormOptions) {
  const form = useForm<UpdateExpenseFormValues>({
    resolver: zodResolver(updateExpenseSchema),
    defaultValues: {
      obligationId: "none",
      isActive: true,
      isTemplate: false,
      currencyExchanges: [],
    },
    values: expense
      ? {
          title: expense.title,
          originalAmount: String(expense.originalAmount),
          originalCurrency: expense.originalCurrency,
          expenseDate: expense.expenseDate,
          categoryId: expense.categoryId,
          paymentMethodId: expense.paymentMethodId,
          obligationId: expense.obligationId ?? "none",
          exchangeRate: String(expense.exchangeRate),
          convertedAmount: String(expense.convertedAmount),
          description: expense.description ?? "",
          receiptNumber: expense.receiptNumber ?? "",
          notes: expense.notes ?? "",
          isActive: expense.isActive,
          isTemplate: expense.isTemplate,
          obligationEquivalentAmount:
            expense.obligationEquivalentAmount != null
              ? String(expense.obligationEquivalentAmount)
              : "",
          currencyExchanges: (expense.currencyExchanges ?? []).map((item) => ({
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
  const watchConvertedAmount = useWatch({ control: form.control, name: "convertedAmount" })

  function onSubmit(values: UpdateExpenseFormValues) {
    if (!expense) return
    const amount = Number(values.originalAmount)
    const effectiveRate = Number(values.exchangeRate) || 1
    const convertedAmount = Number(values.convertedAmount)
    const data: UpdateExpenseRequest = {
      title: values.title,
      originalAmount: amount,
      originalCurrency: values.originalCurrency,
      expenseDate: values.expenseDate,
      categoryId: values.categoryId,
      paymentMethodId: values.paymentMethodId,
      obligationId:
        values.obligationId && values.obligationId !== "none"
          ? values.obligationId
          : null,
      exchangeRate: effectiveRate,
      convertedAmount:
        Number.isFinite(convertedAmount) && convertedAmount > 0
          ? convertedAmount
          : parseFloat((amount * effectiveRate).toFixed(2)),
      description: values.description.trim().length > 0 ? values.description : null,
      receiptNumber: values.receiptNumber.trim().length > 0 ? values.receiptNumber : null,
      notes: values.notes.trim().length > 0 ? values.notes : null,
      isActive: values.isActive,
      isTemplate: values.isTemplate ?? expense.isTemplate,
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

    const hasEquivalentAmount = values.obligationEquivalentAmount.trim().length > 0
    data.obligationEquivalentAmount = hasEquivalentAmount
      ? Number(values.obligationEquivalentAmount)
      : null

    const existingCurrencyExchanges = (expense.currencyExchanges ?? []).map((item) => ({
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

    onSave(expense.id, data)
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
