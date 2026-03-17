"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormModal } from "@/components/shared/form-modal"
import { useUpdateWorkspaceForm } from "@/hooks/forms/use-workspace-form"
import type { WorkspaceResponse, UpdateWorkspaceRequest } from "@/types/workspace"

interface EditWorkspaceModalProps {
  workspace: WorkspaceResponse
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateWorkspaceRequest) => void
}

export function EditWorkspaceModal({ workspace, open, onClose, onSave }: EditWorkspaceModalProps) {
  const { form, onSubmit, handleClose } = useUpdateWorkspaceForm({ workspace, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Editar workspace"
      description="Modifica los datos del workspace."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Guardar"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre *</FormLabel>
            <FormControl>
              <Input autoFocus {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Descripción
              <span className="text-muted-foreground ml-1">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea rows={2} className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Color
                <span className="text-muted-foreground ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="#4CAF50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Ícono
                <span className="text-muted-foreground ml-1">(opcional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="home, briefcase..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormModal>
  )
}
