// services/chatbot-service.ts
// API calls for the Chatbot endpoint.

import { api } from "@/lib/api-client";

export interface ChatHistoryEntry {
  role: "user" | "assistant";
  content: string;
}

export interface ChatbotMessageResponse {
  response: string;
  provider: string;
  model: string;
  usedFinancialContext: boolean;
  toolCallsExecuted: number;
}

/**
 * POST /api/chatbot/message
 * Sends a message to the AI chatbot. Requires authentication.
 * history: previous messages in the session (stateless backend — frontend owns it).
 */
export function sendChatbotMessage(
  message: string,
  history?: ChatHistoryEntry[] | null
) {
  return api.post<ChatbotMessageResponse>("/chatbot/message", {
    message,
    history: history?.length ? history : null,
  });
}
