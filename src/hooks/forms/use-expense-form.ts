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
      description: "",
      notes: "",
      obligationId: "",
      obligationEquivalentAmount: "",
      altCurrency: "",
      altExchangeRate: "",
      altAmount: "",
    },
  })

  const watchCurrency = useWatch({ control: form.control, name: "originalCurrency" })
  const watchAmount = useWatch({ control: form.control, name: "originalAmount" })
  const watchExchangeRate = useWatch({ control: form.control, name: "exchangeRate" })
  const watchAltCurrency = useWatch({ control: form.control, name: "altCurrency" })

  function onSubmit(values: CreateExpenseFormValues) {
    const amount = Number(values.originalAmount)
    const effectiveRate = Number(values.exchangeRate) || 1
    const data: CreateExpenseRequest = {
      title: values.title,
      originalAmount: amount,
      originalCurrency: values.originalCurrency,
      expenseDate: values.expenseDate,
      categoryId: values.categoryId,
      paymentMethodId: values.paymentMethodId,
      exchangeRate: effectiveRate,
      convertedAmount: parseFloat((amount * effectiveRate).toFixed(2)),
    }
    if (values.description) data.description = values.description
    if (values.notes) data.notes = values.notes
    if (values.obligationId && values.obligationId !== "none") {
      data.obligationId = values.obligationId
    }
    if (values.altCurrency) {
      data.altCurrency = values.altCurrency
      if (values.altExchangeRate) data.altExchangeRate = Number(values.altExchangeRate)
      if (values.altAmount) data.altAmount = Number(values.altAmount)
    } else {
      data.altCurrency = null
      data.altExchangeRate = null
      data.altAmount = null
    }
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
    watchAltCurrency,
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
    values: expense
      ? {
          title: expense.title,
          originalAmount: String(expense.originalAmount),
          originalCurrency: expense.originalCurrency,
          expenseDate: expense.expenseDate,
          categoryId: expense.categoryId,
          paymentMethodId: expense.paymentMethodId,
          exchangeRate: String(expense.exchangeRate),
          description: expense.description ?? "",
          notes: expense.notes ?? "",
          obligationEquivalentAmount:
            expense.obligationEquivalentAmount != null
              ? String(expense.obligationEquivalentAmount)
              : "",
          altCurrency: expense.altCurrency ?? "",
          altExchangeRate: expense.altExchangeRate != null ? String(expense.altExchangeRate) : "",
          altAmount: expense.altAmount != null ? String(expense.altAmount) : "",
        }
      : undefined,
  })

  const watchCurrency = useWatch({ control: form.control, name: "originalCurrency" })
  const watchAmount = useWatch({ control: form.control, name: "originalAmount" })
  const watchExchangeRate = useWatch({ control: form.control, name: "exchangeRate" })
  const watchAltCurrency = useWatch({ control: form.control, name: "altCurrency" })

  function onSubmit(values: UpdateExpenseFormValues) {
    if (!expense) return
    const amount = Number(values.originalAmount)
    const effectiveRate = Number(values.exchangeRate) || 1
    const data: UpdateExpenseRequest = {
      title: values.title,
      originalAmount: amount,
      originalCurrency: values.originalCurrency,
      expenseDate: values.expenseDate,
      categoryId: values.categoryId,
      paymentMethodId: values.paymentMethodId,
      exchangeRate: effectiveRate,
      convertedAmount: parseFloat((amount * effectiveRate).toFixed(2)),
    }
    if (values.description) data.description = values.description
    if (values.notes) data.notes = values.notes
    if (expense.obligationId && values.obligationEquivalentAmount) {
      data.obligationEquivalentAmount = Number(values.obligationEquivalentAmount)
    }
    if (values.altCurrency) {
      data.altCurrency = values.altCurrency
      if (values.altExchangeRate) data.altExchangeRate = Number(values.altExchangeRate)
      if (values.altAmount) data.altAmount = Number(values.altAmount)
    } else {
      data.altCurrency = null
      data.altExchangeRate = null
      data.altAmount = null
    }
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
    watchAltCurrency,
  }
}
