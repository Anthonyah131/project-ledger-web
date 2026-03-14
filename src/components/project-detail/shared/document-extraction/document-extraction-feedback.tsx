"use client"

import { TriangleAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DocumentExtractionFeedbackProps {
  warnings: string[]
  error: string | null
}

export function DocumentExtractionFeedback({ warnings, error }: DocumentExtractionFeedbackProps) {
  return (
    <>
      {warnings.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-50/10 text-amber-700 dark:text-amber-400">
          <div className="flex items-start gap-2">
            <TriangleAlert className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <AlertTitle>Avisos del extractor</AlertTitle>
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
          <AlertTitle>No se pudo extraer el documento</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
