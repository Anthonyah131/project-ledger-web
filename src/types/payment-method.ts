// types/payment-method.ts
// Payment method model type definitions

export type PaymentMethodType = 'bank' | 'cash' | 'card';

export interface PaymentMethod {
  id: string;
  /** FK → users — the owner of this account */
  ownerUserId: string;
  /** Descriptive name (e.g. "Banco X - Savings") */
  name: string;
  type: PaymentMethodType;
  /** Account currency (ISO 4217, FK → currencies) */
  currency: string;
  /** Bank or card issuer name */
  bankName: string | null;
  /** Account or card number (last 4 digits, masked, etc.) */
  accountNumber: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}
