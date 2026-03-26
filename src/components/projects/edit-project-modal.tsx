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
import type { ProjectResponse, UpdateProjectRequest } from "@/types/project"
import { useUpdateProjectForm } from "@/hooks/forms/use-project-form"
import { useLanguage } from "@/context/language-context"

interface EditProjectModalProps {
  project: ProjectResponse | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateProjectRequest) => void
}

export function EditProjectModal({
  project,
  open,
  onClose,
  onSave,
}: EditProjectModalProps) {
  const { t } = useLanguage()
  const { form, onSubmit, handleClose } = useUpdateProjectForm({ project, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("projects.editTitle")}
      description={t("projects.editSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("common.save")}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("projects.settingsTab.nameLabel")}</FormLabel>
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
            <FormLabel>{t("projects.settingsTab.descriptionLabel")}</FormLabel>
            <FormControl>
              <Textarea rows={3} className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
