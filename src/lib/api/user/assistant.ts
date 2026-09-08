import { apiFetch, jsonHeaders } from "../core";
import type { AIMessage, AISearchHit, AIStatus } from "../types/assistant";

export function searchAIMessages(q: string, limit = 10) {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return apiFetch<AISearchHit[]>(`/api/ai/search-messages?${params}`);
}

export function getAIStatus() {
  return apiFetch<AIStatus>("/api/ai/status");
}

export function getAIMessages(before?: string, limit = 30) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set("before", before);
  return apiFetch<AIMessage[]>(`/api/ai/messages?${params}`);
}

export async function sendAIChat(
  text: string,
): Promise<AIMessage & { capReached?: boolean }> {
  try {
    return await apiFetch<AIMessage>("/api/ai/chat", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    // apiFetch throws on non-success; surface cap-reached specially.
    if (err instanceof Error && err.message === "daily_cap_reached") {
      return { capReached: true } as AIMessage & { capReached: boolean };
    }
    throw err;
  }
}

export function markAIRead() {
  return apiFetch<void>("/api/ai/read", { method: "POST" });
}

export function confirmAIAction(messageId: string) {
  return apiFetch<AIMessage>(`/api/ai/actions/${messageId}/confirm`, {
    method: "POST",
  });
}

export function dismissAIAction(messageId: string) {
  return apiFetch<AIMessage>(`/api/ai/actions/${messageId}/dismiss`, {
    method: "POST",
  });
}
