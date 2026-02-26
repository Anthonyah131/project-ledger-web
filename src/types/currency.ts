// types/currency.ts
// Currency model type definitions (ISO 4217 catalogue)

export interface Currency {
  /** ISO 4217 code — natural PK (e.g. 'USD', 'CRC', 'EUR') */
  code: string;
  /** Full name (e.g. 'US Dollar') */
  name: string;
  /** Display symbol (e.g. '$', '₡', '€') */
  symbol: string;
  /** Standard decimal places for this currency (0 for CRC/JPY, 2 for USD/EUR) */
  decimalPlaces: number;
  /** Whether this currency is available for use in projects and expenses */
  isActive: boolean;
  createdAt: string;
}
