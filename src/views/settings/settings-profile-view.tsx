"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { ApiClientError } from "@/lib/api-client";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/validations/auth";
import * as userService from "@/services/user-service";
import type { UpdateProfileRequest } from "@/types/user";

function getProfileErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.status === 400) return "Revisa los datos del perfil e intenta de nuevo.";
    if (err.status === 401) return "Tu sesion expiro. Inicia sesion nuevamente.";
    if (err.status === 403) return "No tienes permisos para editar el perfil.";
    if (err.status === 404) return "No se encontro el usuario para actualizar perfil.";
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
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>No hay una sesion activa para mostrar el perfil.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Actualiza tu informacion personal visible en la aplicacion.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src={previewAvatar} alt={previewName} />
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{previewName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
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
              <FormLabel>Correo electronico</FormLabel>
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

            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
