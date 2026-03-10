"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function BillingCancelView() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="size-5 text-muted-foreground" />
            Pago cancelado
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>No se completó la suscripción</AlertTitle>
            <AlertDescription>
              Cancelaste el proceso en Stripe. No se realizó ningún cobro.
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            Puedes volver a intentarlo cuando quieras desde la sección de facturación.
          </p>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/settings/billing">Volver a facturación</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Ir al dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
