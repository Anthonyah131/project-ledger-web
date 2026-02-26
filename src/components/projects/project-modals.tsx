"use client"

import { useState } from "react"
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
import { ISO_CURRENCIES, type ProjectResponse } from "@/types/project"
import { AlertTriangle } from "lucide-react"

// ─── Create Modal ────────────────────────────────────────
interface CreateModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: { name: string; currencyCode: string; description: string }) => void
}

export function CreateProjectModal({ open, onClose, onCreate }: CreateModalProps) {
  const [name, setName] = useState("")
  const [currencyCode, setCurrencyCode] = useState("USD")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<{ name?: string }>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || trimmedName.length > 255) {
      setErrors({
        name: !trimmedName
          ? "Nombre es requerido"
          : "Nombre no puede superar 255 caracteres",
      })
      return
    }
    setErrors({})
    onCreate({ name: trimmedName, currencyCode, description: description.trim() })
    resetAndClose()
  }

  function resetAndClose() {
    setName("")
    setCurrencyCode("USD")
    setDescription("")
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogDescription>
            Crea un nuevo proyecto para gestionar sus gastos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-name">Nombre del proyecto</Label>
            <Input
              id="create-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({})
              }}
              placeholder="Ej: Proyecto Construccion"
              aria-invalid={!!errors.name}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-currency">Moneda</Label>
            <Select value={currencyCode} onValueChange={setCurrencyCode}>
              <SelectTrigger id="create-currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ISO_CURRENCIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="create-desc">Descripcion (opcional)</Label>
            <Textarea
              id="create-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripcion del proyecto..."
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={resetAndClose}>
              Cancelar
            </Button>
            <Button type="submit">Crear proyecto</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Modal ──────────────────────────────────────────
interface EditModalProps {
  project: ProjectResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: { name: string; description: string }) => void
}

export function EditProjectModal({ project, open, onClose, onSave }: EditModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [initialized, setInitialized] = useState(false)

  // Sync state when project changes
  if (project && !initialized) {
    setName(project.name)
    setDescription(project.description || "")
    setInitialized(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!project) return
    const trimmedName = name.trim()
    if (!trimmedName || trimmedName.length > 255) {
      setErrors({
        name: !trimmedName
          ? "Nombre es requerido"
          : "Nombre no puede superar 255 caracteres",
      })
      return
    }
    setErrors({})
    onSave(project.id, { name: trimmedName, description: description.trim() })
    resetAndClose()
  }

  function resetAndClose() {
    setName("")
    setDescription("")
    setErrors({})
    setInitialized(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar proyecto</DialogTitle>
          <DialogDescription>
            Modifica el nombre y la descripcion del proyecto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Nombre del proyecto</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({})
              }}
              aria-invalid={!!errors.name}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-desc">Descripcion</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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

// ─── Delete Confirmation ─────────────────────────────────
interface DeleteModalProps {
  project: ProjectResponse | null
  open: boolean
  onClose: () => void
  onConfirm: (project: ProjectResponse) => void
}

export function DeleteProjectModal({
  project,
  open,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Eliminar proyecto</DialogTitle>
              <DialogDescription className="mt-1">
                {"Esta accion puede desactivarlo, no eliminarlo definitivamente."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <p className="text-sm text-foreground py-2">
          {"Eliminar proyecto "}
          <strong>{`'${project.name}'`}</strong>
          {"?"}
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(project)
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
