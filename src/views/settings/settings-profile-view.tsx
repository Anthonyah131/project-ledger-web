"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { useAuth } from "@/context/auth-context";
import { ApiClientError } from "@/lib/api-client";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/validations/auth";
import * as userService from "@/services/user-service";
import type { UpdateProfileRequest } from "@/types/user";

function getProfileErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.status === 400) return "Revisa los datos del perfil e intenta de nuevo.";
    if (err.status === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
    if (err.status === 403) return "No tienes permisos para editar el perfil.";
    if (err.status === 404) return "No se encontró el usuario para actualizar perfil.";
    return err.message;
  }

  if (err instanceof Error) return err.message;
  return "No fue posible actualizar el perfil.";
}

export function SettingsProfileView() {
  const { user, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    form.reset({
      fullName: user.fullName,
      avatarUrl: user.avatarUrl ?? "",
    });
  }, [form, user]);

  const previewName = form.watch("fullName") || user?.fullName || "Usuario";
  const previewAvatar = form.watch("avatarUrl") || user?.avatarUrl || "";

  const initials = useMemo(
    () =>
      previewName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((segment) => segment[0])
        .join("")
        .toUpperCase() || "U",
    [previewName],
  );

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      const payload: UpdateProfileRequest = {
        fullName: values.fullName.trim(),
      };

      const normalizedAvatar = values.avatarUrl.trim();
      payload.avatarUrl = normalizedAvatar.length > 0 ? normalizedAvatar : null;

      await userService.updateUserProfile(payload);
      await refreshUser();

      toast.success("Perfil actualizado", {
        description: "Tus cambios se guardaron correctamente.",
      });
    } catch (err) {
      toast.error("No se pudo actualizar el perfil", {
        description: getProfileErrorMessage(err),
      });
    } finally {
      setIsSaving(false);
    }
  });

  if (!user) {
    return (
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold">Perfil</h2>
          <p className="text-sm text-muted-foreground">No hay una sesión activa para mostrar el perfil.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-1">
        <h2 className="text-base font-semibold">Perfil público</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Actualiza tu información personal visible en la aplicación.
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
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input disabled={isSaving} autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input value={user.email} readOnly disabled />
                  </FormControl>
                </FormItem>

                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL del avatar</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
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
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
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
          <p className="text-[11px] text-muted-foreground">Vista previa de tu perfil</p>
        </div>
      </div>
    </section>
  );
}
