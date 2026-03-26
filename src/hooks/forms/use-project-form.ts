"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLanguage } from "@/context/language-context"
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectFormValues,
  type UpdateProjectFormValues,
} from "@/lib/validations/project"
import type {
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/types/project"

// ─── Create ───────────────────────────────────────────────────────────────────

interface UseCreateProjectFormOptions {
  onCreate: (data: CreateProjectRequest) => void
  onClose: () => void
}

export function useCreateProjectForm({ onCreate, onClose }: UseCreateProjectFormOptions) {
  const { t } = useLanguage()
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema(t)),
    defaultValues: {
      name: "",
      currencyCode: "USD",
      description: "",
    },
  })

  function onSubmit(values: CreateProjectFormValues) {
    const payload: CreateProjectRequest = {
      name: values.name,
      currencyCode: values.currencyCode,
    }
    if (values.description) payload.description = values.description
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

interface UseUpdateProjectFormOptions {
  project: ProjectResponse | null
  onSave: (id: string, data: UpdateProjectRequest) => void
  onClose: () => void
}

export function useUpdateProjectForm({ project, onSave, onClose }: UseUpdateProjectFormOptions) {
  const { t } = useLanguage()
  const form = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema(t)),
    values: project
      ? {
          name: project.name,
          description: project.description ?? "",
        }
      : undefined,
  })

  function onSubmit(values: UpdateProjectFormValues) {
    if (!project) return
    const payload: UpdateProjectRequest = {
      name: values.name,
    }
    if (values.description) payload.description = values.description
    else payload.description = null
    onSave(project.id, payload)
    handleClose()
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), handleClose }
}
