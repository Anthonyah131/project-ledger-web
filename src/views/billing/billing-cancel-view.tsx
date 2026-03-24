"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/language-context";

export function BillingCancelView() {
  const { t } = useLanguage()
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="size-5 text-muted-foreground" />
            {t("billing.cancelPage.title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>{t("billing.cancelPage.subtitle")}</AlertTitle>
            <AlertDescription>
              {t("billing.cancelPage.description")}
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            {t("billing.cancelPage.hint")}
          </p>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/settings/billing">{t("billing.cancelPage.backToBilling")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">{t("billing.cancelPage.goToDashboard")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
