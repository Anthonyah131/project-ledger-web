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
import { useUpdatePartnerForm } from "@/hooks/forms/use-partner-form"
import type { PartnerResponse, UpdatePartnerRequest } from "@/types/partner"
import { useLanguage } from "@/context/language-context"

interface EditPartnerModalProps {
  partner: PartnerResponse
  open: boolean
  onClose: () => void
  onSave: (id: string, data: UpdatePartnerRequest) => void
}

export function EditPartnerModal({ partner, open, onClose, onSave }: EditPartnerModalProps) {
  const { form, onSubmit, handleClose } = useUpdatePartnerForm({ partner, onSave, onClose })
  const { t } = useLanguage()

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("partners.editTitle")}
      description={t("partners.editSubtitle")}
      form={form}
      onSubmit={onSubmit}
      submitLabel={t("common.save")}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("common.name")} *</FormLabel>
            <FormControl>
              <Input autoFocus {...field} />
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
                <Input type="email" {...field} />
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
                <Input {...field} />
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
              <Textarea rows={2} className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
