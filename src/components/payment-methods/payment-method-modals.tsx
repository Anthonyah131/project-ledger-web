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
  PaymentMethodResponse,
  PaymentMethodType,
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from "@/types/payment-method"

const TYPE_LABEL: Record<PaymentMethodType, string> = {
  bank: "Cuenta bancaria",
  cash: "Efectivo",
  card: "Tarjeta",
}

// ─── Create ───────────────────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreatePaymentMethodRequest) => void
}

export function CreatePaymentMethodModal({ open, onClose, onCreate }: CreateModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<PaymentMethodType>("bank")
  const [currency, setCurrency] = useState("USD")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<{ name?: string }>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 255) {
      setErrors({ name: !trimmed ? "Nombre es requerido" : "Máx. 255 caracteres" })
      return
    }
    setErrors({})
    const payload: CreatePaymentMethodRequest = {
      name: trimmed,
      type,
      currency,
    }
    if (bankName.trim()) payload.bankName = bankName.trim()
    if (accountNumber.trim()) payload.accountNumber = accountNumber.trim()
    if (description.trim()) payload.description = description.trim()
    onCreate(payload)
    resetAndClose()
  }

  function resetAndClose() {
    setName(""); setType("bank"); setCurrency("USD")
    setBankName(""); setAccountNumber(""); setDescription("")
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo método de pago</DialogTitle>
          <DialogDescription>
            Agrega una cuenta bancaria, tarjeta o efectivo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="pm-name">Nombre</Label>
            <Input
              id="pm-name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({}) }}
              placeholder="Ej: Cuenta BAC Principal"
              aria-invalid={!!errors.name}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive" role="alert">{errors.name}</p>}
          </div>

          {/* Type + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pm-type">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as PaymentMethodType)}>
                <SelectTrigger id="pm-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABEL) as PaymentMethodType[]).map((t) => (
                    <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pm-currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="pm-currency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ISO_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bank fields — visible for bank/card */}
          {type !== "cash" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pm-bank">
                  {type === "card" ? "Emisor" : "Banco"}
                  <span className="text-muted-foreground ml-1">(opcional)</span>
                </Label>
                <Input
                  id="pm-bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder={type === "card" ? "Visa / Mastercard…" : "BAC Credomatic…"}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pm-account">
                  {type === "card" ? "Últimos 4 dígitos" : "N.° cuenta"}
                  <span className="text-muted-foreground ml-1">(opcional)</span>
                </Label>
                <Input
                  id="pm-account"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={type === "card" ? "4321" : "001-123456-7"}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="pm-desc">
              Descripción
              <span className="text-muted-foreground ml-1">(opcional)</span>
            </Label>
            <Textarea
              id="pm-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas adicionales…"
              rows={2}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetAndClose}>Cancelar</Button>
            <Button type="submit">Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

interface EditModalProps {
  paymentMethod: PaymentMethodResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdatePaymentMethodRequest) => void
}

export function EditPaymentMethodModal({ paymentMethod, open, onClose, onSave }: EditModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<PaymentMethodType>("bank")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [initialized, setInitialized] = useState(false)

  if (paymentMethod && !initialized) {
    setName(paymentMethod.name)
    setType(paymentMethod.type)
    setBankName(paymentMethod.bankName ?? "")
    setAccountNumber(paymentMethod.accountNumber ?? "")
    setDescription(paymentMethod.description ?? "")
    setInitialized(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!paymentMethod) return
    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 255) {
      setErrors({ name: !trimmed ? "Nombre es requerido" : "Máx. 255 caracteres" })
      return
    }
    setErrors({})
    const payload: UpdatePaymentMethodRequest = { name: trimmed, type }
    if (bankName.trim()) payload.bankName = bankName.trim()
    if (accountNumber.trim()) payload.accountNumber = accountNumber.trim()
    if (description.trim()) payload.description = description.trim()
    onSave(paymentMethod.id, payload)
    resetAndClose()
  }

  function resetAndClose() {
    setName(""); setType("bank"); setBankName("")
    setAccountNumber(""); setDescription(""); setErrors({})
    setInitialized(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar método de pago</DialogTitle>
          <DialogDescription>
            Modifica los datos del método de pago.
            {paymentMethod && (
              <span className="ml-1 font-medium text-foreground">
                La moneda ({paymentMethod.currency}) no se puede cambiar.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-pm-name">Nombre</Label>
            <Input
              id="edit-pm-name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({}) }}
              aria-invalid={!!errors.name}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive" role="alert">{errors.name}</p>}
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-pm-type">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as PaymentMethodType)}>
              <SelectTrigger id="edit-pm-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABEL) as PaymentMethodType[]).map((t) => (
                  <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bank fields */}
          {type !== "cash" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-pm-bank">
                  {type === "card" ? "Emisor" : "Banco"}
                  <span className="text-muted-foreground ml-1">(opcional)</span>
                </Label>
                <Input id="edit-pm-bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-pm-account">
                  {type === "card" ? "Últimos 4 dígitos" : "N.° cuenta"}
                  <span className="text-muted-foreground ml-1">(opcional)</span>
                </Label>
                <Input id="edit-pm-account" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-pm-desc">
              Descripción
              <span className="text-muted-foreground ml-1">(opcional)</span>
            </Label>
            <Textarea
              id="edit-pm-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetAndClose}>Cancelar</Button>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete ───────────────────────────────────────────────────────────────────

interface DeleteModalProps {
  paymentMethod: PaymentMethodResponse | null
  open: boolean
  onClose: () => void
  onConfirm: (pm: PaymentMethodResponse) => void
}

export function DeletePaymentMethodModal({ paymentMethod, open, onClose, onConfirm }: DeleteModalProps) {
  if (!paymentMethod) return null
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Eliminar método de pago</DialogTitle>
              <DialogDescription className="mt-1">
                Esta acción puede desactivarlo, no eliminarlo definitivamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <p className="text-sm text-foreground py-2">
          {"Eliminar "}
          <strong>{`'${paymentMethod.name}'`}</strong>
          {"?"}
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={() => { onConfirm(paymentMethod); onClose() }}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
