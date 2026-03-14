"use client"

import { useCallback, useRef, useState } from "react"
import type { OcrExtractionQuotaResponse } from "@/types/expense"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { FileText, Loader2, Sparkles, UploadCloud, X } from "lucide-react"
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (file: File | null) => {
      setSelectedFile(file)
      onFileChange(file)
    },
    [onFileChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0] ?? null
      handleFileSelect(file)
    },
    [handleFileSelect],
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleRemoveFile = () => {
    setSelectedFile(null)
    onFileChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const isDisabled = extracting || extractionDisabled

  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <p className="text-sm font-medium">{title}</p>
        </div>
        <Badge variant={getExtractionQuotaBadgeVariant(quota)}>
          {quotaLoading ? "Cargando cuota..." : getExtractionQuotaBadgeLabel(quota)}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">{description}</p>

      {quotaError && <p className="text-xs text-destructive">{quotaError}</p>}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona de carga de documento"
        onClick={() => !selectedFile && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !selectedFile) {
            inputRef.current?.click()
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors px-4 py-6",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border/50 bg-muted/10 hover:border-border hover:bg-muted/20",
          selectedFile && "cursor-default border-border/50 hover:border-border/50 hover:bg-muted/10",
          isDisabled && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />

        {selectedFile ? (
          <div className="flex w-full items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              aria-label="Quitar archivo"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveFile()
              }}
              className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud
              className={cn(
                "size-8 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground/60",
              )}
            />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Arrastra un archivo o{" "}
                <span className="font-medium text-foreground underline-offset-2 hover:underline cursor-pointer">
                  selecciona uno
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                PDF, JPG, PNG, WEBP — hasta 10 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Document kind selector + extract button */}
      <div className="flex items-center gap-2">
        <Select
          value={documentKind}
          onValueChange={(value) => onDocumentKindChange(value as DocumentKind)}
          disabled={isDisabled}
        >
          <SelectTrigger className="w-[150px] shrink-0">
            <SelectValue placeholder="Tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="receipt">Recibo</SelectItem>
            <SelectItem value="invoice">Factura</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          className="flex-1"
          onClick={onExtract}
          disabled={isDisabled || !selectedFile}
        >
          {extracting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Extrayendo...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Extraer con IA
            </>
          )}
        </Button>
      </div>

      {/* Extract meta */}
      {extractMeta && (
        <p className="text-xs text-muted-foreground/70">
          Proveedor: {extractMeta.provider} · Modelo: {extractMeta.modelId} · Tipo:{" "}
          {extractMeta.documentKind}
        </p>
      )}
    </div>
  )
}
