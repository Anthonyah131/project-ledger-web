"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ISO_CURRENCIES } from "@/types/project"
import type {
  ExpenseResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from "@/types/expense"
import type { CategoryResponse } from "@/types/category"
import type { PaymentMethodResponse } from "@/types/payment-method"
import type { ObligationResponse } from "@/types/obligation"

// ─── Create ───────────────────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateExpenseRequest) => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  obligations: ObligationResponse[]
  projectCurrency: string
}

export function CreateExpenseModal({
  open,
  onClose,
  onCreate,
  categories,
  paymentMethods,
  obligations,
  projectCurrency,
}: CreateModalProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("CRC")
  const [expenseDate, setExpenseDate] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [paymentMethodId, setPaymentMethodId] = useState("")
  const [exchangeRate, setExchangeRate] = useState("1")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [obligationId, setObligationId] = useState("")
  const [altCurrency, setAltCurrency] = useState("")
  const [altExchangeRate, setAltExchangeRate] = useState("")
  const [altAmount, setAltAmount] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Derive defaults inline — no useEffect needed
  const effectiveCategoryId =
    categoryId || categories.find((c) => c.isDefault)?.id || categories[0]?.id || ""
  const effectivePaymentMethodId = paymentMethodId || paymentMethods[0]?.id || ""

  function validate() {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = "Título es requerido"
    if (!amount || Number(amount) <= 0) errs.amount = "Monto debe ser mayor a 0"
    if (!expenseDate) errs.expenseDate = "Fecha es requerida"
    if (!effectiveCategoryId) errs.categoryId = "Categoría es requerida"
    if (!effectivePaymentMethodId) errs.paymentMethodId = "Método de pago es requerido"
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    const effectiveRate = Number(exchangeRate) || 1
    const data: CreateExpenseRequest = {
      title: title.trim(),
      originalAmount: Number(amount),
      originalCurrency: currency,
      expenseDate,
      categoryId: effectiveCategoryId,
      paymentMethodId: effectivePaymentMethodId,
      exchangeRate: effectiveRate,
      convertedAmount: parseFloat((Number(amount) * effectiveRate).toFixed(2)),
    }
    if (description.trim()) data.description = description.trim()
    if (notes.trim()) data.notes = notes.trim()
    if (obligationId) data.obligationId = obligationId
    if (altCurrency) {
      data.altCurrency = altCurrency
      if (altExchangeRate) data.altExchangeRate = Number(altExchangeRate)
      if (altAmount) data.altAmount = Number(altAmount)
    } else {
      data.altCurrency = null
      data.altExchangeRate = null
      data.altAmount = null
    }
    onCreate(data)
    resetAndClose()
  }

  function resetAndClose() {
    setTitle("")
    setAmount("")
    setCurrency("CRC")
    setExpenseDate("")
    setCategoryId("")
    setPaymentMethodId("")
    setExchangeRate("1")
    setDescription("")
    setNotes("")
    setObligationId("")
    setAltCurrency("")
    setAltExchangeRate("")
    setAltAmount("")
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo gasto</DialogTitle>
          <DialogDescription>Registra un nuevo gasto en el proyecto.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-title">Titulo *</Label>
            <Input
              id="exp-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors((p) => ({ ...p, title: "" }))
              }}
              placeholder="Ej: Almuerzo equipo"
              aria-invalid={!!errors.title}
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-amount">Monto *</Label>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (errors.amount) setErrors((p) => ({ ...p, amount: "" }))
                }}
                placeholder="0.00"
                aria-invalid={!!errors.amount}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-currency">Moneda *</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="exp-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISO_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-date">Fecha del gasto *</Label>
            <Input
              id="exp-date"
              type="date"
              value={expenseDate}
              onChange={(e) => {
                setExpenseDate(e.target.value)
                if (errors.expenseDate) setErrors((p) => ({ ...p, expenseDate: "" }))
              }}
              aria-invalid={!!errors.expenseDate}
            />
            {errors.expenseDate && (
              <p className="text-xs text-destructive">{errors.expenseDate}</p>
            )}
          </div>

          {/* Category + Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-cat">Categoría *</Label>
              <Select value={effectiveCategoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="exp-cat" className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-pm">Metodo de pago *</Label>
              <Select value={effectivePaymentMethodId} onValueChange={setPaymentMethodId}>
                <SelectTrigger id="exp-pm" className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentMethodId && (
                <p className="text-xs text-destructive">{errors.paymentMethodId}</p>
              )}
            </div>
          </div>

          {/* Exchange rate */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-rate">
              Tasa de cambio{" "}
              <span className="font-normal text-xs text-muted-foreground">
                ({currency} → {projectCurrency})
              </span>
            </Label>
            <Input
              id="exp-rate"
              type="number"
              step="0.0001"
              min="0"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
            />
            {amount && Number(exchangeRate) > 0 && (
              <p className="text-xs text-muted-foreground">
                Monto en {projectCurrency}:{" "}
                <span className="font-medium text-foreground">
                  {(Number(amount) * Number(exchangeRate)).toLocaleString("es", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-desc">Descripcion</Label>
            <Textarea
              id="exp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="exp-notes">Notas</Label>
            <Textarea
              id="exp-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Alt currency (optional display) */}
          <div className="rounded-lg border border-dashed border-border px-3 pt-2 pb-3 flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Moneda alternativa (opcional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="exp-alt-currency">Moneda</Label>
                <Select
                  value={altCurrency || "none"}
                  onValueChange={(v) => setAltCurrency(v === "none" ? "" : v)}
                >
                  <SelectTrigger id="exp-alt-currency" className="w-full">
                    <SelectValue placeholder="Ninguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {ISO_CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {altCurrency && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="exp-alt-rate">
                    Tasa ({projectCurrency} → {altCurrency})
                  </Label>
                  <Input
                    id="exp-alt-rate"
                    type="number"
                    step="0.0001"
                    min="0"
                    value={altExchangeRate}
                    onChange={(e) => {
                      setAltExchangeRate(e.target.value)
                      const rate = Number(e.target.value)
                      const converted = Number(amount) * Number(exchangeRate)
                      if (rate > 0 && converted > 0) {
                        setAltAmount((converted * rate).toFixed(2))
                      }
                    }}
                    placeholder="0.0000"
                  />
                </div>
              )}
            </div>
            {altCurrency && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="exp-alt-amount">Monto {altCurrency}</Label>
                <Input
                  id="exp-alt-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={altAmount}
                  onChange={(e) => setAltAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          {/* Obligation (optional) */}
          {obligations.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-obl">Obligación (opcional)</Label>
              <Select value={obligationId} onValueChange={setObligationId}>
                <SelectTrigger id="exp-obl" className="w-full">
                  <SelectValue placeholder="Ninguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna</SelectItem>
                  {obligations.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetAndClose}>
              Cancelar
            </Button>
            <Button type="submit">Crear gasto</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

interface EditModalProps {
  expense: ExpenseResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateExpenseRequest) => void
  categories: CategoryResponse[]
  paymentMethods: PaymentMethodResponse[]
  projectCurrency: string
}

export function EditExpenseModal({
  expense,
  open,
  onClose,
  onSave,
  categories,
  paymentMethods,
  projectCurrency,
}: EditModalProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("CRC")
  const [expenseDate, setExpenseDate] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [paymentMethodId, setPaymentMethodId] = useState("")
  const [exchangeRate, setExchangeRate] = useState("1")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [altCurrency, setAltCurrency] = useState("")
  const [altExchangeRate, setAltExchangeRate] = useState("")
  const [altAmount, setAltAmount] = useState("")
  const [initialized, setInitialized] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (expense && !initialized) {
    setTitle(expense.title)
    setAmount(String(expense.originalAmount))
    setCurrency(expense.originalCurrency)
    setExpenseDate(expense.expenseDate)
    setCategoryId(expense.categoryId)
    setPaymentMethodId(expense.paymentMethodId)
    setExchangeRate(String(expense.exchangeRate))
    setDescription(expense.description ?? "")
    setNotes(expense.notes ?? "")
    setAltCurrency(expense.altCurrency ?? "")
    setAltExchangeRate(expense.altExchangeRate != null ? String(expense.altExchangeRate) : "")
    setAltAmount(expense.altAmount != null ? String(expense.altAmount) : "")
    setInitialized(true)
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = "Título es requerido"
    if (!amount || Number(amount) <= 0) errs.amount = "Monto debe ser mayor a 0"
    if (!expenseDate) errs.expenseDate = "Fecha es requerida"
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!expense) return
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    const effectiveRate = Number(exchangeRate) || 1
    const data: UpdateExpenseRequest = {
      title: title.trim(),
      originalAmount: Number(amount),
      originalCurrency: currency,
      expenseDate,
      categoryId,
      paymentMethodId,
      exchangeRate: effectiveRate,
      convertedAmount: parseFloat((Number(amount) * effectiveRate).toFixed(2)),
    }
    if (description.trim()) data.description = description.trim()
    if (notes.trim()) data.notes = notes.trim()
    if (altCurrency) {
      data.altCurrency = altCurrency
      if (altExchangeRate) data.altExchangeRate = Number(altExchangeRate)
      if (altAmount) data.altAmount = Number(altAmount)
    } else {
      data.altCurrency = null
      data.altExchangeRate = null
      data.altAmount = null
    }
    onSave(expense.id, data)
    resetAndClose()
  }

  function resetAndClose() {
    setTitle("")
    setAmount("")
    setCurrency("CRC")
    setExpenseDate("")
    setCategoryId("")
    setPaymentMethodId("")
    setExchangeRate("1")
    setDescription("")
    setNotes("")
    setAltCurrency("")
    setAltExchangeRate("")
    setAltAmount("")
    setInitialized(false)
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar gasto</DialogTitle>
          <DialogDescription>Modifica los datos de este gasto.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-exp-title">Titulo *</Label>
            <Input
              id="edit-exp-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors((p) => ({ ...p, title: "" }))
              }}
              aria-invalid={!!errors.title}
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-exp-amount">Monto *</Label>
              <Input
                id="edit-exp-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (errors.amount) setErrors((p) => ({ ...p, amount: "" }))
                }}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-exp-currency">Moneda *</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="edit-exp-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISO_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-exp-date">Fecha del gasto *</Label>
            <Input
              id="edit-exp-date"
              type="date"
              value={expenseDate}
              onChange={(e) => {
                setExpenseDate(e.target.value)
                if (errors.expenseDate) setErrors((p) => ({ ...p, expenseDate: "" }))
              }}
              aria-invalid={!!errors.expenseDate}
            />
            {errors.expenseDate && (
              <p className="text-xs text-destructive">{errors.expenseDate}</p>
            )}
          </div>

          {/* Category + Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-exp-cat">Categoría *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="edit-exp-cat" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-exp-pm">Metodo de pago *</Label>
              <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                <SelectTrigger id="edit-exp-pm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exchange rate */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-exp-rate">
              Tasa de cambio{" "}
              <span className="font-normal text-xs text-muted-foreground">
                ({currency} → {projectCurrency})
              </span>
            </Label>
            <Input
              id="edit-exp-rate"
              type="number"
              step="0.0001"
              min="0"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
            />
            {amount && Number(exchangeRate) > 0 && (
              <p className="text-xs text-muted-foreground">
                Monto en {projectCurrency}:{" "}
                <span className="font-medium text-foreground">
                  {(Number(amount) * Number(exchangeRate)).toLocaleString("es", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-exp-desc">Descripcion</Label>
            <Textarea
              id="edit-exp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-exp-notes">Notas</Label>
            <Textarea
              id="edit-exp-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Alt currency (optional display) */}
          <div className="rounded-lg border border-dashed border-border px-3 pt-2 pb-3 flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Moneda alternativa (opcional)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-exp-alt-currency">Moneda</Label>
                <Select
                  value={altCurrency || "none"}
                  onValueChange={(v) => setAltCurrency(v === "none" ? "" : v)}
                >
                  <SelectTrigger id="edit-exp-alt-currency" className="w-full">
                    <SelectValue placeholder="Ninguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {ISO_CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {altCurrency && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-exp-alt-rate">
                    Tasa ({projectCurrency} → {altCurrency})
                  </Label>
                  <Input
                    id="edit-exp-alt-rate"
                    type="number"
                    step="0.0001"
                    min="0"
                    value={altExchangeRate}
                    onChange={(e) => {
                      setAltExchangeRate(e.target.value)
                      const rate = Number(e.target.value)
                      const converted = Number(amount) * Number(exchangeRate)
                      if (rate > 0 && converted > 0) {
                        setAltAmount((converted * rate).toFixed(2))
                      }
                    }}
                    placeholder="0.0000"
                  />
                </div>
              )}
            </div>
            {altCurrency && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-exp-alt-amount">Monto {altCurrency}</Label>
                <Input
                  id="edit-exp-alt-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={altAmount}
                  onChange={(e) => setAltAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetAndClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete ───────────────────────────────────────────────────────────────────

interface DeleteModalProps {
  expense: ExpenseResponse | null
  open: boolean
  onClose: () => void
  onConfirm: (expense: ExpenseResponse) => void
}

export function DeleteExpenseModal({ expense, open, onClose, onConfirm }: DeleteModalProps) {
  if (!expense) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Eliminar gasto</DialogTitle>
              <DialogDescription className="mt-1">
                Esta acción no se puede deshacer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <p className="text-sm text-foreground py-2">
          {"¿Eliminar gasto "}
          <strong>{`"${expense.title}"`}</strong>
          {"?"}
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(expense)
              onClose()
            }}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
