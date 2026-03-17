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
import { useCreateWorkspaceForm } from "@/hooks/forms/use-workspace-form"
import type { CreateWorkspaceRequest } from "@/types/workspace"

interface CreateWorkspaceModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateWorkspaceRequest) => void
}

export function CreateWorkspaceModal({ open, onClose, onCreate }: CreateWorkspaceModalProps) {
  const { form, onSubmit, handleClose } = useCreateWorkspaceForm({ onCreate, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Nuevo workspace"
      description="Agrupa proyectos relacionados en un workspace."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Crear"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Casa Miravalles" autoFocus {...field} />
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
              <Textarea rows={2} className="resize-none" placeholder="Descripción del workspace..." {...field} />
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
