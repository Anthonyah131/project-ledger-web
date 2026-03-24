"use client";

import { KeyRound, Loader2, LogOut, ShieldAlert, Trash2 } from "lucide-react";

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
import { useSettingsSecurity } from "@/hooks/settings/use-settings-security";

export function SettingsSecurityView() {
  const {
    t,
    isLoggingOutAll,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteConfirmation,
    setDeleteConfirmation,
    isDeletingAccount,
    confirmWord,
    handleStartPasswordResetFlow,
    handleLogoutAllDevices,
    handleDeleteAccount,
  } = useSettingsSecurity();

  return (
    <div className="space-y-10">
      {/* Contraseña */}
      <section>
        <div className="mb-1">
          <h2 className="text-base font-semibold">{t("settings.security.passwordTitle")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("settings.security.passwordSubtitle")}
          </p>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>{t("settings.security.passwordStep1")}</li>
            <li>{t("settings.security.passwordStep2")}</li>
            <li>{t("settings.security.passwordStep3")}</li>
          </ol>

          <Button
            size="sm"
            variant="outline"
            onClick={handleStartPasswordResetFlow}
            className="shrink-0 gap-2"
          >
            <KeyRound className="size-4" />
            {t("settings.security.changePassword")}
          </Button>
        </div>
      </section>

      {/* Sesiones */}
      <section>
        <div className="mb-1">
          <h2 className="text-base font-semibold">{t("settings.security.sessionsTitle")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("settings.security.sessionsSubtitle")}
          </p>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("settings.security.sessionsDescription")}
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
                {t("settings.security.closingSessions")}
              </>
            ) : (
              <>
                <LogOut className="size-4" />
                {t("settings.security.closeAllSessions")}
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Zona de riesgo */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-2 border-b border-destructive/20 px-5 py-4">
          <ShieldAlert className="size-4 text-destructive" />
          <h2 className="text-base font-semibold text-destructive">{t("settings.security.dangerZone")}</h2>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">{t("settings.security.deleteAccountTitle")}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("settings.security.deleteAccountDescription")}
            </p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="shrink-0 gap-2"
          >
            <Trash2 className="size-4" />
            {t("settings.security.deleteAccountTitle")}
          </Button>
        </div>
      </section>

      {/* Dialog de confirmación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.security.deleteAccountDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("settings.security.deleteAccountDialogDescriptionPrefix")}{" "}
              <span className="font-mono font-semibold text-destructive">{confirmWord}</span>{" "}
              {t("settings.security.deleteAccountDialogDescriptionSuffix")}
            </DialogDescription>
          </DialogHeader>

          <Input
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder={t("settings.security.deleteAccountPlaceholder")}
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
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={
                isDeletingAccount || deleteConfirmation.trim().toUpperCase() !== confirmWord
              }
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("common.deleting")}
                </>
              ) : (
                t("settings.security.deleteAccountSubmit")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
