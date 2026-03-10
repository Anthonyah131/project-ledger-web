"use client";

import { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { ApiClientError } from "@/lib/api-client";
import * as userService from "@/services/user-service";

function getDeleteAccountErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.status === 401) return "Tu sesion expiro. Inicia sesion nuevamente.";
    if (err.status === 403) return "No tienes permisos para eliminar la cuenta.";
    if (err.status === 404) return "No se encontro la cuenta para eliminar.";
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
    const target = email.length > 0
      ? `/forgot-password?email=${encodeURIComponent(email)}&from=settings`
      : "/forgot-password?from=settings";

    router.push(target);
  }

  async function handleLogoutAllDevices() {
    setIsLoggingOutAll(true);
    try {
      await logoutAll();
      toast.success("Sesion cerrada en todos los dispositivos");
      router.replace("/login");
    } catch {
      toast.error("No se pudo cerrar la sesion en todos los dispositivos");
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contrasena</CardTitle>
          <CardDescription>
            Usa el flujo completo por correo para enviar token, verificarlo y definir una nueva contrasena.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Enviar codigo al correo de tu cuenta.</li>
            <li>Ingresar el token de 6 digitos.</li>
            <li>Definir una nueva contrasena.</li>
          </ol>

          <Alert>
            <AlertTitle>Seguridad</AlertTitle>
            <AlertDescription>
              Al completar el cambio, backend revoca las sesiones activas y deberas iniciar sesion nuevamente.
            </AlertDescription>
          </Alert>

          <Button onClick={handleStartPasswordResetFlow}>
            Iniciar flujo de cambio por correo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones</CardTitle>
          <CardDescription>Cierra tus sesiones activas en otros dispositivos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogoutAllDevices} disabled={isLoggingOutAll}>
            {isLoggingOutAll ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Cerrando sesiones...
              </>
            ) : (
              "Cerrar sesion en todos los dispositivos"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zona de riesgo</CardTitle>
          <CardDescription>Acciones irreversibles sobre tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <ShieldAlert className="size-4" />
            <AlertTitle>Eliminar cuenta</AlertTitle>
            <AlertDescription>
              Esta accion desactiva tu cuenta y no podras volver a iniciar sesion con este usuario.
            </AlertDescription>
          </Alert>

          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            Eliminar cuenta
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminacion de cuenta</DialogTitle>
            <DialogDescription>
              Escribe ELIMINAR para confirmar. Esta accion no se puede deshacer.
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
              disabled={isDeletingAccount || deleteConfirmation.trim().toUpperCase() !== "ELIMINAR"}
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
