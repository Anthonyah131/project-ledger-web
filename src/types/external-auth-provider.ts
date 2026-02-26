// types/external-auth-provider.ts
// OAuth external auth provider model type definitions

export type OAuthProvider = 'google' | 'microsoft' | 'github' | 'facebook' | 'apple';

export interface ExternalAuthProvider {
  id: string;
  /** FK → users */
  userId: string;
  provider: OAuthProvider;
  /** User ID assigned by the external provider */
  providerUserId: string;
  /** Email reported by the provider (may differ from local email) */
  providerEmail: string | null;
  /** Encrypted hash of the provider access token */
  accessTokenHash: string | null;
  /** Encrypted hash of the provider refresh token */
  refreshTokenHash: string | null;
  tokensExpiresAt: string | null;
  /** Raw claims / profile data returned by the provider */
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
}
