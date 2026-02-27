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
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category"

// ─── Create ───────────────────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateCategoryRequest) => void
}

export function CreateCategoryModal({ open, onClose, onCreate }: CreateModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = "Nombre es requerido"
    if (budgetAmount && Number(budgetAmount) < 0) errs.budgetAmount = "Debe ser positivo"
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
    const data: CreateCategoryRequest = { name: name.trim() }
    if (description.trim()) data.description = description.trim()
    if (budgetAmount) data.budgetAmount = Number(budgetAmount)
    onCreate(data)
    resetAndClose()
  }

  function resetAndClose() {
    setName("")
    setDescription("")
    setBudgetAmount("")
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
          <DialogDescription>Agrega una categoría al proyecto.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-name">Nombre *</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((p) => ({ ...p, name: "" }))
              }}
              placeholder="Ej: Alimentación"
              aria-invalid={!!errors.name}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-desc">Descripción</Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-budget">Presupuesto</Label>
            <Input
              id="cat-budget"
              type="number"
              step="0.01"
              min="0"
              value={budgetAmount}
              onChange={(e) => {
                setBudgetAmount(e.target.value)
                if (errors.budgetAmount) setErrors((p) => ({ ...p, budgetAmount: "" }))
              }}
              placeholder="Sin límite"
              aria-invalid={!!errors.budgetAmount}
            />
            {errors.budgetAmount && (
              <p className="text-xs text-destructive">{errors.budgetAmount}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetAndClose}>
              Cancelar
            </Button>
            <Button type="submit">Crear categoría</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

interface EditModalProps {
  category: CategoryResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateCategoryRequest) => void
}

export function EditCategoryModal({
  category,
  open,
  onClose,
  onSave,
}: EditModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [initialized, setInitialized] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (category && !initialized) {
    setName(category.name)
    setDescription(category.description ?? "")
    setBudgetAmount(category.budgetAmount != null ? String(category.budgetAmount) : "")
    setInitialized(true)
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = "Nombre es requerido"
    if (budgetAmount && Number(budgetAmount) < 0) errs.budgetAmount = "Debe ser positivo"
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) return
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    const data: UpdateCategoryRequest = { name: name.trim() }
    if (description.trim()) data.description = description.trim()
    data.budgetAmount = budgetAmount ? Number(budgetAmount) : null
    onSave(category.id, data)
    resetAndClose()
  }

  function resetAndClose() {
    setName("")
    setDescription("")
    setBudgetAmount("")
    setInitialized(false)
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar categoría</DialogTitle>
          <DialogDescription>Modifica los datos de esta categoría.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-cat-name">Nombre *</Label>
            <Input
              id="edit-cat-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((p) => ({ ...p, name: "" }))
              }}
              aria-invalid={!!errors.name}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-cat-desc">Descripción</Label>
            <Textarea
              id="edit-cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-cat-budget">Presupuesto</Label>
            <Input
              id="edit-cat-budget"
              type="number"
              step="0.01"
              min="0"
              value={budgetAmount}
              onChange={(e) => {
                setBudgetAmount(e.target.value)
                if (errors.budgetAmount) setErrors((p) => ({ ...p, budgetAmount: "" }))
              }}
              placeholder="Sin límite"
              aria-invalid={!!errors.budgetAmount}
            />
            {errors.budgetAmount && (
              <p className="text-xs text-destructive">{errors.budgetAmount}</p>
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
  category: CategoryResponse | null
  open: boolean
  onClose: () => void
  onConfirm: (cat: CategoryResponse) => void
}

export function DeleteCategoryModal({
  category,
  open,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  if (!category) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Eliminar categoría</DialogTitle>
              <DialogDescription className="mt-1">
                Esta acción no se puede deshacer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <p className="text-sm text-foreground py-2">
          {"¿Eliminar categoría "}
          <strong>{`"${category.name}"`}</strong>
          {"? Los gastos de esta categoría se moverán a la categoría General."}
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(category)
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
