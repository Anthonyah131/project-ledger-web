// types/env.d.ts
// Environment variable type declarations
// Extends ProcessEnv with app-specific variables for type safety

declare namespace NodeJS {
  interface ProcessEnv {
    // Environment
    NEXT_PUBLIC_ENV: "development" | "production";

    // Backend API
    NEXT_PUBLIC_API_URL: string;

    // N8N Chat Widget
    NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL: string;
  }
}

// Extend Window with the n8nChat global injected by @n8n/chat
interface Window {
  n8nChat?: {
    open?: () => void;
    close?: () => void;
  };
}
