"use client"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useUpdateProjectForm } from "@/hooks/forms/use-project-form"
import type { ProjectResponse, UpdateProjectRequest } from "@/types/project"
import { useLanguage } from "@/context/language-context"

export function GeneralSection({
  project,
  isOwner,
  onSave,
}: {
  project: ProjectResponse | null
  isOwner: boolean
  onSave: (id: string, data: UpdateProjectRequest) => void
}) {
  const { t } = useLanguage()
  const { form, onSubmit } = useUpdateProjectForm({
    project,
    onSave,
    onClose: () => {},
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">{t("projects.settingsTab.generalTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("projects.settingsTab.generalSubtitle")}
        </p>
      </div>

      <Separator />

      {!project ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("projects.settingsTab.nameLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!isOwner}
                      className={!isOwner ? "bg-muted/40" : undefined}
                    />
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
                    <Textarea
                      rows={3}
                      className={cn("resize-none", !isOwner && "bg-muted/40")}
                      readOnly={!isOwner}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isOwner && (
              <Button type="submit" size="sm">
                {t("common.save")}
              </Button>
            )}
          </form>
        </Form>
      )}
    </div>
  )
}
