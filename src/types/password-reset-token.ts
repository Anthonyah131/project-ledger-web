// types/password-reset-token.ts
// Password-reset OTP token model type definitions

export interface PasswordResetToken {
  id: string;
  /** FK → users */
  userId: string;
  /** SHA-256 hash of the OTP code (never stored in plain text) */
  codeHash: string;
  expiresAt: string;
  /** Set when the OTP has been used; null = still valid */
  usedAt: string | null;
  createdAt: string;
}
