// types/refresh-token.ts
// Refresh token model type definitions

export interface RefreshToken {
  id: string;
  /** FK → users */
  userId: string;
  /** SHA-256 hash of the actual token (never stored in plain text) */
  tokenHash: string;
  expiresAt: string;
  /** Null when the token is still valid; set on revocation */
  revokedAt: string | null;
  createdAt: string;
}
