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
import { useCreatePartnerForm } from "@/hooks/forms/use-partner-form"
import type { CreatePartnerRequest } from "@/types/partner"
import { useLanguage } from "@/context/language-context"

interface CreatePartnerModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreatePartnerRequest) => void
}

export function CreatePartnerModal({ open, onClose, onCreate }: CreatePartnerModalProps) {
  const { form, onSubmit, handleClose } = useCreatePartnerForm({ onCreate, onClose })
  const { t } = useLanguage()

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("partners.createTitle")}
      description={t("partners.createSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("common.create")}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.name")} *</FormLabel>
            <FormControl>
              <Input placeholder={t("partners.namePlaceholder")} autoFocus {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("common.email")}
                <span className="text-muted-foreground ml-1">{t("common.optional")}</span>
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder={t("partners.emailPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("partners.phonelabel")}
                <span className="text-muted-foreground ml-1">{t("common.optional")}</span>
              </FormLabel>
              <FormControl>
                <Input placeholder={t("partners.phonePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("common.notes")}
              <span className="text-muted-foreground ml-1">{t("common.optional")}</span>
            </FormLabel>
            <FormControl>
              <Textarea rows={2} className="resize-none" placeholder={t("partners.notesPlaceholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
