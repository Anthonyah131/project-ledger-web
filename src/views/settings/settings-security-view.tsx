"use client";

import { useState } from "react";
import { KeyRound, Loader2, LogOut, ShieldAlert, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { ApiClientError } from "@/lib/api-client";
import * as userService from "@/services/user-service";

function getDeleteAccountErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.status === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
    if (err.status === 403) return "No tienes permisos para eliminar la cuenta.";
    if (err.status === 404) return "No se encontró la cuenta para eliminar.";
    return err.message;
  }

  if (err instanceof Error) return err.message;
  return "No fue posible eliminar la cuenta.";
}

export function SettingsSecurityView() {
  const router = useRouter();
  const { user, logout, logoutAll } = useAuth();

  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  function handleStartPasswordResetFlow() {
    const email = user?.email?.trim() ?? "";
    const target =
      email.length > 0
        ? `/forgot-password?email=${encodeURIComponent(email)}&from=settings`
        : "/forgot-password?from=settings";

    router.push(target);
  }

  async function handleLogoutAllDevices() {
    setIsLoggingOutAll(true);
    try {
      await logoutAll();
      toast.success("Sesión cerrada en todos los dispositivos");
      router.replace("/login");
    } catch {
      toast.error("No se pudo cerrar la sesión en todos los dispositivos");
    } finally {
      setIsLoggingOutAll(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation.trim().toUpperCase() !== "ELIMINAR") return;

    setIsDeletingAccount(true);
    try {
      await userService.deleteAccount();
      await logout();
      toast.success("Cuenta eliminada");
      router.replace("/register");
    } catch (err) {
      toast.error("No se pudo eliminar la cuenta", {
        description: getDeleteAccountErrorMessage(err),
      });
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Contraseña */}
      <section>
        <div className="mb-1">
          <h2 className="text-base font-semibold">Contraseña</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cambia tu contraseña mediante el flujo de verificación por correo.
          </p>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Recibe un código de 6 dígitos en tu correo.</li>
            <li>Ingresa el token para verificar tu identidad.</li>
            <li>Define tu nueva contraseña.</li>
          </ol>

          <Button
            size="sm"
            variant="outline"
            onClick={handleStartPasswordResetFlow}
            className="shrink-0 gap-2"
          >
            <KeyRound className="size-4" />
            Cambiar contraseña
          </Button>
        </div>
      </section>

      {/* Sesiones */}
      <section>
        <div className="mb-1">
          <h2 className="text-base font-semibold">Sesiones activas</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cierra tu sesión en todos los dispositivos vinculados a tu cuenta.
          </p>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Todos los tokens activos serán revocados de inmediato.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogoutAllDevices}
            disabled={isLoggingOutAll}
            className="shrink-0 gap-2"
          >
            {isLoggingOutAll ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Cerrando...
              </>
            ) : (
              <>
                <LogOut className="size-4" />
                Cerrar todas las sesiones
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Zona de riesgo */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-2 border-b border-destructive/20 px-5 py-4">
          <ShieldAlert className="size-4 text-destructive" />
          <h2 className="text-base font-semibold text-destructive">Zona de riesgo</h2>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Eliminar cuenta</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Esta acción desactiva tu cuenta de forma permanente.
            </p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="shrink-0 gap-2"
          >
            <Trash2 className="size-4" />
            Eliminar cuenta
          </Button>
        </div>
      </section>

      {/* Dialog de confirmación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación de cuenta</DialogTitle>
            <DialogDescription>
              Escribe{" "}
              <span className="font-mono font-semibold text-destructive">ELIMINAR</span>{" "}
              para confirmar. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder="ELIMINAR"
            autoFocus
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation("");
              }}
              disabled={isDeletingAccount}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={
                isDeletingAccount || deleteConfirmation.trim().toUpperCase() !== "ELIMINAR"
              }
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar definitivamente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
