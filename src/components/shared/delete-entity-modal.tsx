"use client"

import { DeleteConfirmModal } from "@/components/shared/delete-confirm-modal"

interface DeleteEntityModalProps<T> {
  /** The entity to delete (pass null when no entity is selected) */
  item: T | null
  open: boolean
  onClose: () => void
  onConfirm: (item: T) => boolean | void | Promise<boolean | void>
  /** Dialog title, e.g. "Eliminar proyecto" */
  title: string
  /** Subtitle / disclaimer, e.g. "Esta accion no se puede deshacer." */
  description: string
  /** Build the confirmation message from the entity, e.g. (p) => `¿Eliminar "${p.name}"?` */
  getMessage: (item: T) => string
}

export function DeleteEntityModal<T>({
  item,
  open,
  onClose,
  onConfirm,
  title,
  description,
  getMessage,
}: DeleteEntityModalProps<T>) {
  if (!item) return null

  return (
    <DeleteConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={() => onConfirm(item)}
      title={title}
      description={description}
      message={getMessage(item)}
    />
  )
}
