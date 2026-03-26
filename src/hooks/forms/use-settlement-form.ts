"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLanguage } from "@/context/language-context"
import {
  createSettlementSchema,
  updateSettlementSchema,
  type CreateSettlementFormValues,
  type UpdateSettlementFormValues,
} from "@/lib/validations/partner-settlement"
import type {
  CreateSettlementRequest,
  PartnerSettlementResponse,
  UpdateSettlementRequest,
  CurrencyExchangeRequest,
} from "@/types/partner-settlement"

// ─── Create ───────────────────────────────────────────────────────────────────

interface UseCreateSettlementFormOptions {
  projectCurrency: string
  alternativeCurrencyCodes: string[]
  prefill?: { fromPartnerId: string; toPartnerId: string; amount: string }
  onCreate: (data: CreateSettlementRequest) => void
  onClose: () => void
}

export function useCreateSettlementForm({
  projectCurrency,
  alternativeCurrencyCodes,
  prefill,
  onCreate,
  onClose,
}: UseCreateSettlementFormOptions) {
  const { t } = useLanguage()
  const today = new Date().toISOString().split("T")[0]

  const form = useForm<CreateSettlementFormValues>({
    resolver: zodResolver(createSettlementSchema(t)),
    defaultValues: {
      fromPartnerId: "",
      toPartnerId: "",
      amount: "",
      currency: projectCurrency,
      exchangeRate: "1",
      settlementDate: today,
      description: "",
      notes: "",
      currencyExchanges: alternativeCurrencyCodes.map((code) => ({
        currencyCode: code,
        exchangeRate: "",
        convertedAmount: "",
      })),
    },
  })

  const { fields, replace } = useFieldArray({ control: form.control, name: "currencyExchanges" })

  // Apply prefill values when provided (from settlement suggestions)
  useEffect(() => {
    if (!prefill) return
    form.setValue("fromPartnerId", prefill.fromPartnerId)
    form.setValue("toPartnerId", prefill.toPartnerId)
    form.setValue("amount", prefill.amount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill])

  // Sync field array when alternative currencies change
  useEffect(() => {
    replace(
      alternativeCurrencyCodes.map((code) => ({
        currencyCode: code,
        exchangeRate: "",
        convertedAmount: "",
      })),
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alternativeCurrencyCodes.join(",")])

  function onSubmit(values: CreateSettlementFormValues) {
    const payload: CreateSettlementRequest = {
      fromPartnerId: values.fromPartnerId,
      toPartnerId: values.toPartnerId,
      amount: Number(values.amount),
      currency: values.currency.toUpperCase(),
      exchangeRate: parseFloat(Number(values.exchangeRate).toFixed(6)),
      settlementDate: values.settlementDate,
    }
    if (values.description) payload.description = values.description
    if (values.notes) payload.notes = values.notes
    const exchanges = buildExchangePayload(values.currencyExchanges)
    if (exchanges.length > 0) payload.currencyExchanges = exchanges
    onCreate(payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, fields, onSubmit: form.handleSubmit(onSubmit), handleClose }
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UseUpdateSettlementFormOptions {
  settlement: PartnerSettlementResponse | null
  alternativeCurrencyCodes: string[]
  onSave: (id: string, data: UpdateSettlementRequest) => void
  onClose: () => void
}

export function useUpdateSettlementForm({
  settlement,
  alternativeCurrencyCodes,
  onSave,
  onClose,
}: UseUpdateSettlementFormOptions) {
  const { t } = useLanguage()
  const form = useForm<UpdateSettlementFormValues>({
    resolver: zodResolver(updateSettlementSchema(t)),
    values: settlement
      ? {
          amount: String(settlement.amount),
          currency: settlement.currency,
          exchangeRate: String(settlement.exchangeRate),
          settlementDate: settlement.settlementDate,
          description: settlement.description ?? "",
          notes: settlement.notes ?? "",
          currencyExchanges: mergeExchanges(
            alternativeCurrencyCodes,
            settlement.currencyExchanges,
          ),
        }
      : undefined,
  })

  const { fields } = useFieldArray({ control: form.control, name: "currencyExchanges" })

  function onSubmit(values: UpdateSettlementFormValues) {
    if (!settlement) return
    const payload: UpdateSettlementRequest = {
      amount: Number(values.amount),
      currency: values.currency.toUpperCase(),
      exchangeRate: parseFloat(Number(values.exchangeRate).toFixed(6)),
      settlementDate: values.settlementDate,
      description: values.description,
      notes: values.notes,
      // Always send currencyExchanges so PATCH can clear if needed
      currencyExchanges: buildExchangePayload(values.currencyExchanges),
    }
    onSave(settlement.id, payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, fields, onSubmit: form.handleSubmit(onSubmit), handleClose }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildExchangePayload(
  items: Array<{ currencyCode: string; exchangeRate: string; convertedAmount: string }>,
): CurrencyExchangeRequest[] {
  return items
    .filter(
      (item) =>
        item.currencyCode &&
        Number(item.exchangeRate) > 0 &&
        Number(item.convertedAmount) > 0,
    )
    .map((item) => ({
      currencyCode: item.currencyCode,
      exchangeRate: parseFloat(Number(item.exchangeRate).toFixed(6)),
      convertedAmount: Number(item.convertedAmount),
    }))
}

function mergeExchanges(
  altCodes: string[],
  existing: Array<{ currencyCode: string; exchangeRate: number; convertedAmount: number }>,
): Array<{ currencyCode: string; exchangeRate: string; convertedAmount: string }> {
  return altCodes.map((code) => {
    const found = existing.find((e) => e.currencyCode === code)
    return {
      currencyCode: code,
      exchangeRate: found ? String(found.exchangeRate) : "",
      convertedAmount: found ? String(found.convertedAmount) : "",
    }
  })
}
