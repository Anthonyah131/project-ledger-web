"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormModal } from "@/components/shared/form-modal"
import { ISO_CURRENCIES, type CreateProjectRequest } from "@/types/project"
import { useCreateProjectForm } from "@/hooks/forms/use-project-form"
import { useLanguage } from "@/context/language-context"

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateProjectRequest) => void
}

export function CreateProjectModal({ open, onClose, onCreate }: CreateProjectModalProps) {
  const { t } = useLanguage()
  const { form, onSubmit, handleClose } = useCreateProjectForm({ onCreate, onClose })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("projects.new")}
      description={t("projects.createSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("projects.createTitle")}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("projects.settingsTab.nameLabel")}</FormLabel>
            <FormControl>
              <Input placeholder={t("projects.namePlaceholder")} autoFocus {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="currencyCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.currency")}</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ISO_CURRENCIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("projects.descriptionOptional")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("projects.descriptionPlaceholder")}
                rows={3}
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
