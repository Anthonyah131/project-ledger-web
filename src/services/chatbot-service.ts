// services/chatbot-service.ts
// API calls for the Chatbot endpoint.

import { getAccessToken, getLanguage } from "@/lib/api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5192/api";

export interface ChatHistoryEntry {
  role: "user" | "assistant";
  content: string;
}

export interface ChatbotStreamMeta {
  type: "meta";
  provider?: string;
  model?: string;
  usedFinancialContext?: boolean;
  toolCallsExecuted?: number;
}

export interface ChatbotStreamCallbacks {
  onChunk: (text: string) => void;
  onMeta: (meta: ChatbotStreamMeta) => void;
  onError: (message: string) => void;
  onDone: () => void;
}

/**
 * POST /api/chatbot/message/stream
 * Same as sendChatbotMessage but streams the LLM response token by token via SSE.
 * Fires callbacks as events arrive; call abort.abort() to cancel.
 */
export function streamChatbotMessage(
  message: string,
  history: ChatHistoryEntry[] | null | undefined,
  callbacks: ChatbotStreamCallbacks,
  signal?: AbortSignal,
): void {
  const token = getAccessToken();

  const run = async () => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/chatbot/message/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": getLanguage(),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, history: history?.length ? history : null }),
        signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      callbacks.onError("network");
      callbacks.onDone();
      return;
    }

    if (!response.ok || !response.body) {
      callbacks.onError(`http_${response.status}`);
      callbacks.onDone();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice("data: ".length).trim();
          try {
            const event = JSON.parse(json);
            if (event.type === "chunk") callbacks.onChunk(event.content ?? "");
            if (event.type === "meta")  callbacks.onMeta(event as ChatbotStreamMeta);
            if (event.type === "done")  { callbacks.onDone(); return; }
            if (event.type === "error") callbacks.onError(event.content ?? "unknown");
          } catch {
            // malformed line, skip
          }
        }
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        callbacks.onError("stream");
      }
    }

    callbacks.onDone();
  };

  run();
}
