"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiClientError } from "@/lib/api-client";
import { getBillingStatusMeta } from "@/lib/billing-utils";
import * as billingService from "@/services/billing-service";
import type { BillingSubscriptionResponse } from "@/types/subscription";

const POLLING_EVERY_MS = 3_000;
const POLLING_TIMEOUT_MS = 60_000;

type PollState = "polling" | "success" | "timeout" | "error" | "disabled";

function getBillingErrorMessage(err: unknown): string {
  if (billingService.isStripeDisabledError(err)) {
    return "La facturación con Stripe está deshabilitada por configuración.";
  }

  if (err instanceof ApiClientError) {
    if (err.status === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
    if (err.status === 403) return "No tienes permisos para consultar esta suscripción.";
    return err.message;
  }

  if (err instanceof Error) return err.message;
  return "No fue posible consultar el estado de la suscripción.";
}

function getBadgeToneClass(tone: "success" | "warning" | "danger" | "muted"): string {
  switch (tone) {
    case "success":
      return "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400";
    case "warning":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "danger":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export function BillingSuccessView() {
  const [pollState, setPollState] = useState<PollState>("polling");
  const [attempts, setAttempts] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<BillingSubscriptionResponse | null>(null);
  const [pollSeed, setPollSeed] = useState(0);

  const restartPolling = useCallback(() => {
    setPollState("polling");
    setAttempts(0);
    setElapsedSeconds(0);
    setError(null);
    setSubscription(null);
    setPollSeed((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timerId: number | null = null;
    const startedAt = Date.now();

    const runPoll = async (): Promise<"resolved" | "pending" | "error"> => {
      setAttempts((value) => value + 1);

      try {
        const data = await billingService.getMySubscription();
        if (cancelled) return "resolved";

        setSubscription(data);
        setPollState("success");
        return "resolved";
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          return "pending";
        }

        if (billingService.isStripeDisabledError(err)) {
          if (!cancelled) {
            setError(getBillingErrorMessage(err));
            setPollState("disabled");
          }
          return "error";
        }

        if (!cancelled) {
          setError(getBillingErrorMessage(err));
          setPollState("error");
        }
        return "error";
      }
    };

    async function start() {
      const firstResult = await runPoll();
      if (firstResult !== "pending" || cancelled) return;

      timerId = window.setInterval(async () => {
        const elapsed = Date.now() - startedAt;
        setElapsedSeconds(Math.floor(elapsed / 1000));

        if (elapsed >= POLLING_TIMEOUT_MS) {
          if (timerId !== null) {
            window.clearInterval(timerId);
          }
          if (!cancelled) {
            setPollState("timeout");
          }
          return;
        }

        const result = await runPoll();
        if (result !== "pending" && timerId !== null) {
          window.clearInterval(timerId);
        }
      }, POLLING_EVERY_MS);
    }

    start();

    return () => {
      cancelled = true;
      if (timerId !== null) {
        window.clearInterval(timerId);
      }
    };
  }, [pollSeed]);

  const statusMeta = useMemo(
    () => (subscription ? getBillingStatusMeta(subscription.status) : null),
    [subscription],
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
            {pollState === "disabled" ? "Facturación no disponible" : "Pago confirmado"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {pollState === "polling" && (
            <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirmando suscripción en Project Ledger...
              </div>
              <p className="mt-2 text-xs">
                Intentos: {attempts} · Tiempo: {elapsedSeconds}s
              </p>
            </div>
          )}

          {pollState === "success" && subscription && statusMeta && (
            <>
              <Alert>
                <AlertTitle>Suscripción sincronizada</AlertTitle>
                <AlertDescription>
                  Tu plan ya está actualizado y listo para usarse.
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={getBadgeToneClass(statusMeta.tone)}>
                  {statusMeta.label}
                </Badge>
                <Badge variant="outline">{subscription.planName}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">{statusMeta.description}</p>
            </>
          )}

          {pollState === "timeout" && (
            <Alert>
              <AlertTitle>Seguimos procesando tu pago</AlertTitle>
              <AlertDescription>
                El webhook puede tardar unos segundos más. Reintenta para consultar de nuevo.
              </AlertDescription>
            </Alert>
          )}

          {pollState === "error" && (
            <Alert variant="destructive">
              <AlertTitle>No se pudo confirmar la suscripción</AlertTitle>
              <AlertDescription>{error ?? "Error desconocido."}</AlertDescription>
            </Alert>
          )}

          {pollState === "disabled" && (
            <Alert>
              <AlertTitle>Stripe deshabilitado</AlertTitle>
              <AlertDescription>
                {error ?? "La facturación con Stripe está deshabilitada por configuración."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2">
          {(pollState === "polling" || pollState === "timeout" || pollState === "error") && (
            <Button type="button" onClick={restartPolling}>
              <RefreshCw className="size-4" />
              Reintentar
            </Button>
          )}

          {(pollState === "success" || pollState === "timeout" || pollState === "error" || pollState === "disabled") && (
            <Button asChild variant="outline">
              <Link href="/billing">Ver facturación</Link>
            </Button>
          )}

          <Button asChild variant="ghost">
            <Link href="/dashboard">Ir al dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
