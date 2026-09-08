import type { ChatMessage } from "@/lib/api";
import { formatChatMessagePreview } from "@/components/team/messages/chat-preview-utils";

export const LOCAL_MESSAGE_INDEX_KEY = "ababilx_chat_local_index";
const LIMIT = 100;

export type LocalIndexedMessage = {
  id: string;
  body: string;
  created_at: string;
};

let cache: Record<string, LocalIndexedMessage[]> | null = null;

function loadCache(): Record<string, LocalIndexedMessage[]> {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = {};
    return cache;
  }
  try {
    cache = JSON.parse(localStorage.getItem(LOCAL_MESSAGE_INDEX_KEY) || "{}") as Record<
      string,
      LocalIndexedMessage[]
    >;
  } catch {
    cache = {};
  }
  return cache;
}

function persistCache() {
  if (typeof window === "undefined" || !cache) return;
  try {
    localStorage.setItem(LOCAL_MESSAGE_INDEX_KEY, JSON.stringify(cache));
  } catch {
    const ids = Object.keys(cache);
    while (ids.length > 0) {
      const drop = ids.pop();
      if (drop) delete cache[drop];
      try {
        localStorage.setItem(LOCAL_MESSAGE_INDEX_KEY, JSON.stringify(cache));
        return;
      } catch {
        /* keep dropping conversations */
      }
    }
  }
}

function toSearchText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return formatChatMessagePreview({ body: trimmed, textOnly: true }).replace(/\s+/g, " ").trim();
}

function entryFromMessage(message: ChatMessage): LocalIndexedMessage | null {
  if (message.deleted_at || message.decryption_failed) return null;
  const body = toSearchText(message.body ?? "");
  if (!body) return null;
  return { id: message.id, body, created_at: message.created_at };
}

function mergeNewest(
  current: LocalIndexedMessage[],
  incoming: LocalIndexedMessage[],
): LocalIndexedMessage[] {
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(-LIMIT);
}

export function rememberLocalMessages(conversationId: string, messages: ChatMessage[]) {
  if (!messages.length) return;
  const store = loadCache();
  let list = store[conversationId] ?? [];
  const incoming: LocalIndexedMessage[] = [];
  for (const message of messages) {
    const entry = entryFromMessage(message);
    if (entry) incoming.push(entry);
    else list = list.filter((item) => item.id !== message.id);
  }
  store[conversationId] = incoming.length ? mergeNewest(list, incoming) : list;
  persistCache();
}

export function removeLocalMessage(conversationId: string, messageId: string) {
  const store = loadCache();
  const list = store[conversationId];
  if (!list) return;
  store[conversationId] = list.filter((item) => item.id !== messageId);
  persistCache();
}

export function clearLocalMessageIndex() {
  cache = {};
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_MESSAGE_INDEX_KEY);
}

function snippetAround(body: string, index: number, needleLength: number) {
  const start = Math.max(0, index - 24);
  const end = Math.min(body.length, index + needleLength + 36);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < body.length ? "…" : "";
  return `${prefix}${body.slice(start, end)}${suffix}`;
}

export function localMessageSearchHit(
  conversationId: string,
  query: string,
): { snippet: string; messageId: string } | null {
  const needle = query.trim().toLowerCase();
  if (!needle) return null;
  const list = loadCache()[conversationId] ?? [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const body = toSearchText(list[i].body);
    const at = body.toLowerCase().indexOf(needle);
    if (at >= 0) {
      return {
        snippet: snippetAround(body, at, needle.length),
        messageId: list[i].id,
      };
    }
  }
  return null;
}
