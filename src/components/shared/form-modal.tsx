"use client"

import type { ReactNode } from "react"
import type { FieldValues, UseFormReturn } from "react-hook-form"
import { useLanguage } from "@/context/language-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

interface FormModalProps<T extends FieldValues> {
  open: boolean
  onClose: () => void
  title: string
  description: ReactNode
  form: UseFormReturn<T>
  onSubmit: (e?: React.BaseSyntheticEvent) => void
  submitLabel: string
  submitDisabled?: boolean
  submitHidden?: boolean
  /** Extra class names for DialogContent (e.g. scroll overflow). */
  contentClassName?: string
  children: ReactNode
}

export function FormModal<T extends FieldValues>({
  open,
  onClose,
  title,
  description,
  form,
  onSubmit,
  submitLabel,
  submitDisabled = false,
  submitHidden = false,
  contentClassName,
  children,
}: FormModalProps<T>) {
  const { t } = useLanguage()

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={contentClassName ?? "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {children}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              {!submitHidden && (
                <Button type="submit" disabled={submitDisabled}>
                  {submitLabel}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
