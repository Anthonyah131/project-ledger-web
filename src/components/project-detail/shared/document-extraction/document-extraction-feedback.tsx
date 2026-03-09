"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DocumentExtractionFeedbackProps {
  warnings: string[]
  error: string | null
}

export function DocumentExtractionFeedback({ warnings, error }: DocumentExtractionFeedbackProps) {
  return (
    <>
      {warnings.length > 0 && (
        <Alert>
          <AlertTitle>Revisa estos avisos</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
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
