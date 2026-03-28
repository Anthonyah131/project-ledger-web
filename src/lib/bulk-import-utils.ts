// lib/bulk-import-utils.ts
// Utilities for parsing clipboard data (Excel/Google Sheets paste) into bulk import rows.

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/** A single row parsed from pasted clipboard data */
export interface ParsedBulkRow {
  title: string
  amount: number | null
  date: string // "YYYY-MM-DD" or empty
  description: string
}

/** Result of a paste parse operation — includes rows + validation feedback */
export interface ParseResult {
  rows: ParsedBulkRow[]
  /** Non-blocking issues shown as warnings */
  warnings: string[]
  /**
   * Blocking error that prevents accepting the paste.
   * When set, the rows array should be ignored.
   */
  error: string | null
  stats: {
    totalInputRows: number
    parsedRows: number
    missingAmounts: number
    missingDates: number
    missingTitles: number
    hasHeaders: boolean
  }
}

/** Column mapping detected from the pasted data */
type ColumnRole = "title" | "amount" | "date" | "description" | "unknown"

const HEADER_PATTERNS: Record<Exclude<ColumnRole, "unknown">, RegExp> = {
  title: /^(title|titulo|título|nombre|concepto|name)$/i,
  amount: /^(amount|monto|cantidad|total|importe|valor)$/i,
  date: /^(date|fecha|day|dia|día)$/i,
  description: /^(description|descripcion|descripción|detalle|detail|nota|note|obs|observación)$/i,
}

function isHeaderRow(cells: string[]): boolean {
  return cells.some((cell) => {
    const trimmed = cell.trim()
    return Object.values(HEADER_PATTERNS).some((re) => re.test(trimmed))
  })
}

function mapColumnsFromHeaders(headers: string[]): ColumnRole[] {
  return headers.map((header) => {
    const trimmed = header.trim()
    for (const [role, re] of Object.entries(HEADER_PATTERNS)) {
      if (re.test(trimmed)) return role as ColumnRole
    }
    return "unknown"
  })
}

/**
 * Heuristic column mapping when no header row is detected.
 * Default order assumption: Title | Amount | Date | Description
 * Falls back to type detection if data doesn't match that order.
 */
function mapColumnsFromData(rows: string[][]): ColumnRole[] {
  // Sample multiple rows to get better type detection
  const sampleRows = rows.slice(0, Math.min(3, rows.length))
  const numCols = Math.max(...sampleRows.map((r) => r.length))

  // Count how many sample rows match each type for each column position
  const amountScores: number[] = new Array(numCols).fill(0)
  const dateScores: number[] = new Array(numCols).fill(0)
  const textScores: number[] = new Array(numCols).fill(0)

  for (const row of sampleRows) {
    for (let i = 0; i < row.length; i++) {
      const cell = row[i].trim()
      if (!cell) continue
      if (looksLikeDate(cell)) dateScores[i]++
      else if (looksLikeNumber(cell)) amountScores[i]++
      else textScores[i]++
    }
  }

  const roles: ColumnRole[] = new Array(numCols).fill("unknown")
  const assigned = new Set<number>()

  // Find best amount column (highest numeric score)
  let bestAmount = -1
  let bestAmountScore = 0
  for (let i = 0; i < numCols; i++) {
    if (amountScores[i] > bestAmountScore) {
      bestAmountScore = amountScores[i]
      bestAmount = i
    }
  }
  if (bestAmount >= 0 && bestAmountScore > 0) {
    roles[bestAmount] = "amount"
    assigned.add(bestAmount)
  }

  // Find best date column
  let bestDate = -1
  let bestDateScore = 0
  for (let i = 0; i < numCols; i++) {
    if (!assigned.has(i) && dateScores[i] > bestDateScore) {
      bestDateScore = dateScores[i]
      bestDate = i
    }
  }
  if (bestDate >= 0 && bestDateScore > 0) {
    roles[bestDate] = "date"
    assigned.add(bestDate)
  }

  // Remaining text columns: first = title, second = description
  let titleAssigned = false
  for (let i = 0; i < numCols; i++) {
    if (!assigned.has(i) && textScores[i] > 0) {
      if (!titleAssigned) {
        roles[i] = "title"
        assigned.add(i)
        titleAssigned = true
      } else {
        roles[i] = "description"
        assigned.add(i)
        break
      }
    }
  }

  return roles
}

function looksLikeNumber(value: string): boolean {
  const cleaned = value.replace(/[$€¥£₡\s]/g, "").replace(",", ".")
  return !isNaN(Number(cleaned)) && cleaned.length > 0 && Number(cleaned) > 0
}

function looksLikeDate(value: string): boolean {
  if (ISO_DATE_REGEX.test(value)) return true
  if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}$/.test(value)) return true
  return false
}

function normalizeDate(value: string): string {
  const trimmed = value.trim()
  if (ISO_DATE_REGEX.test(trimmed)) return trimmed

  const slashMatch = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/)
  if (slashMatch) {
    const [, a, b, yearRaw] = slashMatch
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw
    const day = Number(a)
    const month = Number(b)
    if (day > 12) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }
    return `${year}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`
  }

  return ""
}

function parseAmount(value: string): number | null {
  let cleaned = value.trim().replace(/[$€¥£₡]/g, "").trim()
  const lastComma = cleaned.lastIndexOf(",")
  const lastDot = cleaned.lastIndexOf(".")
  if (lastComma > lastDot) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".")
  } else {
    cleaned = cleaned.replace(/,/g, "")
  }
  cleaned = cleaned.replace(/\s/g, "")
  const num = Number(cleaned)
  if (!Number.isFinite(num) || num <= 0) return null
  return num
}

/**
 * Parses tab-separated clipboard data into structured rows with validation feedback.
 *
 * Returns a `ParseResult` containing:
 * - `rows`: the parsed rows (may be empty)
 * - `error`: a blocking error string if the paste is invalid
 * - `warnings`: non-blocking issues to show the user
 * - `stats`: parsing statistics
 */
export function parseClipboardData(clipboardText: string): ParseResult {
  const empty: ParseResult = {
    rows: [],
    warnings: [],
    error: null,
    stats: { totalInputRows: 0, parsedRows: 0, missingAmounts: 0, missingDates: 0, missingTitles: 0, hasHeaders: false },
  }

  const text = clipboardText.trim()
  if (!text) {
    return { ...empty, error: "parse.emptyPaste" }
  }

  // Must contain tabs — otherwise it's not spreadsheet data
  if (!text.includes("\t")) {
    return {
      ...empty,
      error: "parse.noTabs",
    }
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) {
    return { ...empty, error: "parse.noRows" }
  }

  const allCells = lines.map((line) => line.split("\t"))
  const hasHeader = isHeaderRow(allCells[0])
  let columnMap: ColumnRole[]
  let dataRows: string[][]

  if (hasHeader) {
    columnMap = mapColumnsFromHeaders(allCells[0])
    dataRows = allCells.slice(1)
  } else {
    columnMap = mapColumnsFromData(allCells)
    dataRows = allCells
  }

  // Check if any column was mapped to "title" or "amount"
  const hasTitleCol = columnMap.includes("title")
  const hasAmountCol = columnMap.includes("amount")

  if (!hasTitleCol && !hasAmountCol) {
    return {
      ...empty,
      error: "parse.noUsableColumns",
    }
  }

  const rows: ParsedBulkRow[] = []
  let missingAmounts = 0
  let missingDates = 0
  let missingTitles = 0

  for (const cells of dataRows) {
    const row: ParsedBulkRow = { title: "", amount: null, date: "", description: "" }

    for (let i = 0; i < cells.length; i++) {
      const role = columnMap[i] ?? "unknown"
      const cellValue = cells[i].trim()
      if (!cellValue) continue
      switch (role) {
        case "title":
          row.title = cellValue
          break
        case "amount":
          row.amount = parseAmount(cellValue)
          break
        case "date":
          row.date = normalizeDate(cellValue)
          break
        case "description":
          row.description = cellValue
          break
      }
    }

    // Only include rows that have at least a title or amount
    if (row.title || row.amount !== null) {
      if (!row.title) missingTitles++
      if (row.amount === null) missingAmounts++
      if (!row.date) missingDates++
      rows.push(row)
    }
  }

  if (rows.length === 0) {
    return { ...empty, error: "parse.noUsableRows" }
  }

  const warnings: string[] = []
  const total = rows.length

  // Blocking: >75% of rows have no title
  if (missingTitles / total > 0.75) {
    return {
      ...empty,
      error: "parse.missingTitles",
    }
  }

  // Warnings for partial missing data
  if (missingAmounts / total > 0.5) {
    warnings.push("parse.warn.manyMissingAmounts")
  }
  if (missingDates / total > 0.5) {
    warnings.push("parse.warn.manyMissingDates")
  }

  return {
    rows: rows.slice(0, BULK_IMPORT_MAX_ITEMS),
    warnings,
    error: null,
    stats: {
      totalInputRows: dataRows.length,
      parsedRows: rows.length,
      missingAmounts,
      missingDates,
      missingTitles,
      hasHeaders: hasHeader,
    },
  }
}

/** Maximum number of items allowed in a single bulk import */
export const BULK_IMPORT_MAX_ITEMS = 100
