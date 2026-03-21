// services/chatbot-service.ts
// API calls for the Chatbot endpoint.

import { api } from "@/lib/api-client";

export interface ChatbotMessageResponse {
  response: string;
  provider: string;
  model: string;
}

/**
 * POST /api/chatbot/message
 * Sends a message to the AI chatbot. Requires authentication.
 */
export function sendChatbotMessage(message: string) {
  return api.post<ChatbotMessageResponse>("/chatbot/message", { message });
}
