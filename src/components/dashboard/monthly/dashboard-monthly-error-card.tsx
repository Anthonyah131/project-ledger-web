"use client"

import { IconRefresh } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/context/language-context"

interface DashboardMonthlyErrorCardProps {
  error: string
  onRetry: () => void
}

export function DashboardMonthlyErrorCard({ error, onRetry }: DashboardMonthlyErrorCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="border-destructive/40 bg-destructive/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-foreground">
          {t("dashboard.monthly.errorCard.title")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">{error}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" onClick={onRetry}>
          <IconRefresh className="size-4" />
          {t("dashboard.monthly.errorCard.retry")}
        </Button>
      </CardFooter>
    </Card>
  )
}
