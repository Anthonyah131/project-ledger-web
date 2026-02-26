// types/env.d.ts
// Environment variable type declarations
// Extends ProcessEnv with app-specific variables for type safety

declare namespace NodeJS {
  interface ProcessEnv {
    // Environment
    NEXT_PUBLIC_ENV: "development" | "production";

    // Backend API
    NEXT_PUBLIC_API_URL: string;
  }
}
