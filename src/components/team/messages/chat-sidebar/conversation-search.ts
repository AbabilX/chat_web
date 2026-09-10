import type { ChatConversation } from "@/lib/api";
import { chatConvLabel } from "../chat-utils";

export type ConversationSearchHit = {
  conv: ChatConversation;
  snippet: string | null;
  messageId: string | null;
};

export type MessageSearchHit = {
  snippet: string;
  messageId: string;
};

/**
 * Signal-Android list search (`Section.Chats` then `Section.Messages`):
 * name-matched threads first, keyword hits in bodies below. A conversation
 * can appear in both. Empty query returns the input as chats so the idle
 * list stays one unsectioned feed.
 */
export function splitConversationSearch(
  conversations: ChatConversation[],
  query: string,
  messageHit: (conversationId: string, query: string) => MessageSearchHit | null,
): { chats: ConversationSearchHit[]; messages: ConversationSearchHit[] } {
  const q = query.trim();
  const chats: ConversationSearchHit[] = [];
  const messages: ConversationSearchHit[] = [];
  for (const conv of conversations) {
    if (!q) {
      chats.push({ conv, snippet: null, messageId: null });
      continue;
    }
    if (conversationMatchesName(conv, q)) {
      chats.push({ conv, snippet: null, messageId: null });
    }
    const hit = messageHit(conv.id, q);
    if (hit) {
      messages.push({
        conv,
        snippet: hit.snippet,
        messageId: hit.messageId,
      });
    }
  }
  return { chats, messages };
}

export function conversationMatchesName(
  conv: ChatConversation,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return [chatConvLabel(conv), conv.name, conv.slug, conv.peer_user_name].some(
    (field) => (field ?? "").toLowerCase().includes(needle),
  );
}
