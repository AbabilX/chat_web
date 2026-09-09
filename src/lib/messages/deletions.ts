import { apiFetch } from "@/lib/api/core";
import type { ChatMessage } from "@/lib/api/types/chat";
import { readChatOutbox, removeChatOutboxEntry } from "./outbox/db";

export interface ChatDeletion {
  conversation_id: string;
  message_id: string;
  through_at: string;
  deleted_at: string;
  entire_conversation: boolean;
}

const snapshots = new Map<string, ChatDeletion[]>();
export function deletionSnapshot(userId: string): ChatDeletion[] {
  if (!snapshots.has(userId)) {
    try { snapshots.set(userId, JSON.parse(localStorage.getItem(`chat-deletions:${userId}`) ?? "[]")); }
    catch { snapshots.set(userId, []); }
  }
  return snapshots.get(userId) ?? [];
}

export function timestampMicros(value: string): number {
  const fraction = value.match(/\.(\d+)(?:Z|[+-]\d\d:\d\d)$/)?.[1] ?? "";
  return Date.parse(value) * 1000 + Number(fraction.padEnd(6, "0").slice(3, 6));
}

export function rememberDeletedMessage(userId: string, conversationId: string, messageId: string) {
  const now = new Date().toISOString();
  const markers = [...deletionSnapshot(userId), {conversation_id: conversationId, message_id: messageId, through_at: now, deleted_at: now, entire_conversation: false}];
  snapshots.set(userId, markers);
  localStorage.setItem(`chat-deletions:${userId}`, JSON.stringify(markers));
}

export function messageSurvives(message: ChatMessage, markers: ChatDeletion[]): boolean {
  return !message.deleted_at && !markers.some((item) =>
    item.conversation_id === message.conversation_id &&
    (item.message_id ? item.message_id === message.id :
      item.entire_conversation || timestampMicros(message.created_at) <= timestampMicros(item.through_at)),
  );
}

export function conversationSurvives(conversation: {id: string; last_message_at?: string | null}, markers: ChatDeletion[]): boolean {
  return !markers.some((item) => !item.message_id && item.conversation_id === conversation.id &&
    (item.entire_conversation || !conversation.last_message_at ||
      timestampMicros(conversation.last_message_at) <= timestampMicros(item.through_at)));
}

export async function syncChatDeletions(userId: string): Promise<ChatDeletion[]> {
  if (!userId) return [];
  const next = await apiFetch<ChatDeletion[]>("/api/me/chat-deletions");
  const merged = new Map<string, ChatDeletion>();
  for (const item of [...deletionSnapshot(userId), ...next]) {
    const key = `${item.conversation_id}:${item.message_id}`;
    const previous = merged.get(key);
    if (!previous || Date.parse(item.deleted_at) >= Date.parse(previous.deleted_at)) merged.set(key, item);
  }
  const markers = [...merged.values()];
  snapshots.set(userId, markers);
  localStorage.setItem(`chat-deletions:${userId}`, JSON.stringify(markers));
  for (const entry of await readChatOutbox()) {
    if (entry.userId === userId && markers.some((item) => !item.message_id &&
      item.conversation_id === entry.conversationId &&
      (item.entire_conversation || entry.createdAt <= Date.parse(item.deleted_at)))) {
      await removeChatOutboxEntry(entry.clientMessageId);
    }
  }
  return markers;
}
