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
import { useLanguage } from "@/context/language-context"
import type { CreateWorkspaceRequest } from "@/types/workspace"

interface CreateWorkspaceModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateWorkspaceRequest) => void
}

export function CreateWorkspaceModal({ open, onClose, onCreate }: CreateWorkspaceModalProps) {
  const { t } = useLanguage()
  const { form, onSubmit, handleClose } = useCreateWorkspaceForm({ onCreate, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("workspaces.createTitle")}
      description={t("workspaces.createSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("common.create")}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.name")} {t("common.required")}</FormLabel>
            <FormControl>
              <Input placeholder={t("workspaces.namePlaceholder")} autoFocus {...field} />
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
              <Textarea rows={2} className="resize-none" placeholder={t("workspaces.descriptionPlaceholder")} {...field} />
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
