"use client"

import { TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useLanguage } from "@/context/language-context"

interface DocumentExtractionFeedbackProps {
  warnings: string[]
  error: string | null
}

export function DocumentExtractionFeedback({ warnings, error }: DocumentExtractionFeedbackProps) {
  const { t } = useLanguage()
  return (
    <>
      {warnings.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-50/10 text-amber-700 dark:text-amber-400">
          <div className="flex items-start gap-2">
            <TriangleAlert className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <AlertTitle>{t("documentExtraction.feedback.warningsTitle")}</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("documentExtraction.feedback.errorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
