"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  type CreateWorkspaceFormValues,
  type UpdateWorkspaceFormValues,
} from "@/lib/validations/workspace"
import type {
  WorkspaceResponse,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from "@/types/workspace"

// ─── Create ───────────────────────────────────────────────────────────────────

interface UseCreateWorkspaceFormOptions {
  onCreate: (data: CreateWorkspaceRequest) => void
  onClose: () => void
}

export function useCreateWorkspaceForm({ onCreate, onClose }: UseCreateWorkspaceFormOptions) {
  const form = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "", description: "", color: "", icon: "" },
  })

  function onSubmit(values: CreateWorkspaceFormValues) {
    const payload: CreateWorkspaceRequest = { name: values.name }
    if (values.description) payload.description = values.description
    if (values.color) payload.color = values.color
    if (values.icon) payload.icon = values.icon
    onCreate(payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UseUpdateWorkspaceFormOptions {
  workspace: WorkspaceResponse | null
  onSave: (id: string, data: UpdateWorkspaceRequest) => void
  onClose: () => void
}

export function useUpdateWorkspaceForm({ workspace, onSave, onClose }: UseUpdateWorkspaceFormOptions) {
  const form = useForm<UpdateWorkspaceFormValues>({
    resolver: zodResolver(updateWorkspaceSchema),
    values: workspace
      ? {
          name: workspace.name,
          description: workspace.description ?? "",
          color: workspace.color ?? "",
          icon: workspace.icon ?? "",
        }
      : undefined,
  })

  function onSubmit(values: UpdateWorkspaceFormValues) {
    if (!workspace) return
    const payload: UpdateWorkspaceRequest = { name: values.name }
    if (values.description) payload.description = values.description
    if (values.color) payload.color = values.color
    if (values.icon) payload.icon = values.icon
    onSave(workspace.id, payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}
