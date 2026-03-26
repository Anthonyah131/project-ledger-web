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
import { useLanguage } from "@/context/language-context"
import type { WorkspaceResponse, UpdateWorkspaceRequest } from "@/types/workspace"

interface EditWorkspaceModalProps {
  workspace: WorkspaceResponse
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdateWorkspaceRequest) => void
}

export function EditWorkspaceModal({ workspace, open, onClose, onSave }: EditWorkspaceModalProps) {
  const { t } = useLanguage()
  const { form, onSubmit, handleClose } = useUpdateWorkspaceForm({ workspace, onSave, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("workspaces.editTitle")}
      description={t("workspaces.editSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("common.save")}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.name")} {t("common.required")}</FormLabel>
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
              {t("common.description")}
              <span className="text-muted-foreground ml-1">{t("common.optional")}</span>
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
                {t("workspaces.colorLabel")}
                <span className="text-muted-foreground ml-1">{t("common.optional")}</span>
              </FormLabel>
              <FormControl>
                <Input placeholder={t("workspaces.colorPlaceholder")} {...field} />
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
                {t("workspaces.iconLabel")}
                <span className="text-muted-foreground ml-1">{t("common.optional")}</span>
              </FormLabel>
              <FormControl>
                <Input placeholder={t("workspaces.iconPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormModal>
  )
}
