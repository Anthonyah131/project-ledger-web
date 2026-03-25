"use client";

import { Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsProfile } from "@/hooks/settings/use-settings-profile";

export function SettingsProfileView() {
  const {
    user,
    t,
    form,
    isSaving,
    currentLanguage,
    previewName,
    previewAvatar,
    initials,
    onSubmit,
    handleLanguageChange,
  } = useSettingsProfile();

  if (!user) {
    return (
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold">{t("settings.profile.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.profile.noActiveSession")}</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-1">
        <h2 className="text-base font-semibold">{t("settings.profile.section")}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t("settings.profile.subtitle")}
        </p>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Form */}
        <Card className="flex-1">
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("settings.profile.fields.fullName.label")}</FormLabel>
                      <FormControl>
                        <Input disabled={isSaving} autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>{t("settings.profile.fields.email.label")}</FormLabel>
                  <FormControl>
                    <Input value={user.email} readOnly disabled />
                  </FormControl>
                </FormItem>

                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("settings.profile.fields.avatarUrl.label")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("settings.profile.fields.avatarUrl.placeholder")}
                          disabled={isSaving}
                          autoComplete="url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="border-t bg-muted/30 px-6 py-3">
                <Button type="submit" size="sm" disabled={isSaving || !form.formState.isDirty}>
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    t("common.save")
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Avatar preview */}
        <div className="flex shrink-0 flex-col items-center gap-3 rounded-lg border bg-muted/20 p-5 text-center md:w-48">
          <Avatar className="h-20 w-20 rounded-xl shadow-sm">
            <AvatarImage src={previewAvatar} alt={previewName} />
            <AvatarFallback className="rounded-xl text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-tight">{previewName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
          </div>
          <p className="text-[11px] text-muted-foreground">{t("settings.profile.avatarPreview")}</p>
        </div>
      </div>

      <div className="mt-10 mb-1">
        <h2 className="text-base font-semibold">{t("settings.preferences.section")}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t("settings.preferences.subtitle")}
        </p>
      </div>

      <Separator className="my-4" />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1 md:w-1/2">
            <h3 className="text-sm font-medium">{t("settings.preferences.apiLanguage.label")}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {t("settings.preferences.apiLanguage.hint")}
            </p>
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("settings.preferences.appLanguage.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">{t("settings.preferences.appLanguage.es")}</SelectItem>
                <SelectItem value="en">{t("settings.preferences.appLanguage.en")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
