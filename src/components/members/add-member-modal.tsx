"use client"

import { Input } from "@/components/ui/input"
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
import type { AddMemberRequest } from "@/types/project-member"
import { useAddMemberForm } from "@/hooks/forms/use-member-form"
import { useLanguage } from "@/context/language-context"

interface AddMemberModalProps {
  open: boolean
  onClose: () => void
  onAdd: (data: AddMemberRequest) => Promise<boolean>
}

export function AddMemberModal({ open, onClose, onAdd }: AddMemberModalProps) {
  const { form, onSubmit, handleClose } = useAddMemberForm({ onAdd, onClose })
  const { t } = useLanguage()

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("members.addTitle")}
      description={t("members.addSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("members.addMember")}
      submitDisabled={form.formState.isSubmitting}
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("members.emailLabel")} *</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder={t("members.emailPlaceholder")}
                autoComplete="email"
                autoFocus
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("members.roleLabel")} *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("members.roleSelect")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="editor">{t("members.roleEditor")}</SelectItem>
                <SelectItem value="viewer">{t("members.roleViewer")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
