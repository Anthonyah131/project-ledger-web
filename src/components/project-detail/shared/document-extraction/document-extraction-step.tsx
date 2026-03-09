"use client"

import type { OcrExtractionQuotaResponse } from "@/types/expense"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Sparkles, Upload } from "lucide-react"
import {
  getExtractionQuotaBadgeLabel,
  getExtractionQuotaBadgeVariant,
} from "./document-extraction-utils"

type DocumentKind = "receipt" | "invoice"

interface ExtractMeta {
  provider: string
  modelId: string
  documentKind: string
}

interface DocumentExtractionStepProps {
  title: string
  description: string
  quota: OcrExtractionQuotaResponse | null
  quotaLoading: boolean
  quotaError: string | null
  documentKind: DocumentKind
  onDocumentKindChange: (value: DocumentKind) => void
  onFileChange: (file: File | null) => void
  extracting: boolean
  onExtract: () => void
  extractionDisabled?: boolean
  extractMeta: ExtractMeta | null
}

export function DocumentExtractionStep({
  title,
  description,
  quota,
  quotaLoading,
  quotaError,
  documentKind,
  onDocumentKindChange,
  onFileChange,
  extracting,
  onExtract,
  extractionDisabled = false,
  extractMeta,
}: DocumentExtractionStepProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <p className="text-sm font-medium">{title}</p>
        </div>
        <Badge variant={getExtractionQuotaBadgeVariant(quota)}>
          {quotaLoading ? "Cargando cuota..." : getExtractionQuotaBadgeLabel(quota)}
        </Badge>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">{description}</p>

      {quotaError && <p className="mb-3 text-xs text-destructive">{quotaError}</p>}

      <div className="grid gap-3 md:grid-cols-[1fr_190px_auto]">
        <Input
          type="file"
          accept="image/*,.pdf"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null
            onFileChange(nextFile)
          }}
        />

        <Select
          value={documentKind}
          onValueChange={(value) => onDocumentKindChange(value as DocumentKind)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="receipt">Recibo</SelectItem>
            <SelectItem value="invoice">Factura</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="secondary"
          onClick={onExtract}
          disabled={extracting || extractionDisabled}
        >
          {extracting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Extrayendo...
            </>
          ) : (
            <>
              <Upload className="size-4" />
              Extraer
            </>
          )}
        </Button>
      </div>

      {extractMeta && (
        <p className="mt-3 text-xs text-muted-foreground">
          Proveedor: {extractMeta.provider} · Modelo: {extractMeta.modelId} · Tipo: {extractMeta.documentKind}
        </p>
      )}
    </div>
  )
}
