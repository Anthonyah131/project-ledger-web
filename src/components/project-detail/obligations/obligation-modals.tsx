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
  ObligationResponse,
  CreateObligationRequest,
  UpdateObligationRequest,
} from "@/types/obligation"

// ─── Create ───────────────────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateObligationRequest) => void
}

export function CreateObligationModal({ open, onClose, onCreate }: CreateModalProps) {
  const [title, setTitle] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [currency, setCurrency] = useState("CRC")
  const [dueDate, setDueDate] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = "Título es requerido"
    if (!totalAmount || Number(totalAmount) <= 0) errs.totalAmount = "Monto debe ser mayor a 0"
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
    const data: CreateObligationRequest = {
      title: title.trim(),
      totalAmount: Number(totalAmount),
      currency,
    }
    if (dueDate) data.dueDate = dueDate
    if (description.trim()) data.description = description.trim()
    onCreate(data)
    resetAndClose()
  }

  function resetAndClose() {
    setTitle("")
    setTotalAmount("")
    setCurrency("CRC")
    setDueDate("")
    setDescription("")
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva obligación</DialogTitle>
          <DialogDescription>Registra una nueva obligación financiera.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="obl-title">Titulo *</Label>
            <Input
              id="obl-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors((p) => ({ ...p, title: "" }))
              }}
              placeholder="Ej: Préstamo oficina"
              aria-invalid={!!errors.title}
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="obl-amount">Monto total *</Label>
              <Input
                id="obl-amount"
                type="number"
                step="0.01"
                min="0"
                value={totalAmount}
                onChange={(e) => {
                  setTotalAmount(e.target.value)
                  if (errors.totalAmount) setErrors((p) => ({ ...p, totalAmount: "" }))
                }}
                placeholder="0.00"
                aria-invalid={!!errors.totalAmount}
              />
              {errors.totalAmount && (
                <p className="text-xs text-destructive">{errors.totalAmount}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="obl-currency">Moneda *</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="obl-currency" className="w-full">
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

          {/* Due date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="obl-due">Fecha de vencimiento</Label>
            <Input
              id="obl-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="obl-desc">Descripción</Label>
            <Textarea
              id="obl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetAndClose}>
              Cancelar
            </Button>
            <Button type="submit">Crear obligación</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

interface EditModalProps {
  obligation: ObligationResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateObligationRequest) => void
}

export function EditObligationModal({
  obligation,
  open,
  onClose,
  onSave,
}: EditModalProps) {
  const [title, setTitle] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [description, setDescription] = useState("")
  const [initialized, setInitialized] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (obligation && !initialized) {
    setTitle(obligation.title)
    setTotalAmount(String(obligation.totalAmount))
    setDueDate(obligation.dueDate ?? "")
    setDescription(obligation.description ?? "")
    setInitialized(true)
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = "Título es requerido"
    if (!totalAmount || Number(totalAmount) <= 0) errs.totalAmount = "Monto debe ser mayor a 0"
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!obligation) return
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    const data: UpdateObligationRequest = {
      title: title.trim(),
      totalAmount: Number(totalAmount),
    }
    if (dueDate) data.dueDate = dueDate
    else data.dueDate = null
    if (description.trim()) data.description = description.trim()
    onSave(obligation.id, data)
    resetAndClose()
  }

  function resetAndClose() {
    setTitle("")
    setTotalAmount("")
    setDueDate("")
    setDescription("")
    setInitialized(false)
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar obligación</DialogTitle>
          <DialogDescription>Modifica los datos de esta obligación.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-obl-title">Titulo *</Label>
            <Input
              id="edit-obl-title"
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-obl-amount">Monto total *</Label>
            <Input
              id="edit-obl-amount"
              type="number"
              step="0.01"
              min="0"
              value={totalAmount}
              onChange={(e) => {
                setTotalAmount(e.target.value)
                if (errors.totalAmount) setErrors((p) => ({ ...p, totalAmount: "" }))
              }}
              aria-invalid={!!errors.totalAmount}
            />
            {errors.totalAmount && (
              <p className="text-xs text-destructive">{errors.totalAmount}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-obl-due">Fecha de vencimiento</Label>
            <Input
              id="edit-obl-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-obl-desc">Descripción</Label>
            <Textarea
              id="edit-obl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
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
  obligation: ObligationResponse | null
  open: boolean
  onClose: () => void
  onConfirm: (obl: ObligationResponse) => void
}

export function DeleteObligationModal({
  obligation,
  open,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  if (!obligation) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Eliminar obligación</DialogTitle>
              <DialogDescription className="mt-1">
                Esta acción no se puede deshacer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <p className="text-sm text-foreground py-2">
          {"¿Eliminar obligación "}
          <strong>{`"${obligation.title}"`}</strong>
          {"?"}
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(obligation)
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
