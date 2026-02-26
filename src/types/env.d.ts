// types/env.d.ts
// Environment variable type declarations
// Extends ProcessEnv with app-specific variables for type safety

declare namespace NodeJS {
  interface ProcessEnv {
    // App
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_APP_NAME: string;

    // Backend API
    NEXT_PUBLIC_API_URL: string;

    // Auth
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
  }
}
