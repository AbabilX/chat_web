import { syncChatDeletions } from "../deletions";
import { sendChatMessage } from "@/lib/api/user/chat";
import type { ChatMessage } from "@/lib/api/types/chat";
import {
  readChatOutbox,
  removeChatOutboxEntry,
  saveChatOutboxEntry,
} from "./db";
import type { ChatOutboxPayload } from "./types";

// Refusals that mean the ciphertext in a queued payload is sealed to a key some
// member can no longer read. Re-sending it can never succeed, so the entry is
// dropped instead of being retried forever — which would also wedge every later
// message behind it, since replay preserves order by stopping at the first
// failure. The caller re-encrypts under a rotated key.
const staleKeyErrors = new Set([
  "chat_key_rotation_required",
  "message encryption key unavailable",
]);

export function isStaleChatKeyError(error: unknown) {
  return error instanceof Error && staleKeyErrors.has(error.message);
}

export async function sendChatMessageDurably(
  userId: string,
  conversationId: string,
  payload: Omit<ChatOutboxPayload, "client_message_id">,
): Promise<ChatMessage> {
  const clientMessageId = crypto.randomUUID();
  const complete: ChatOutboxPayload = {
    ...payload,
    client_message_id: clientMessageId,
  };
  await saveChatOutboxEntry({
    clientMessageId,
    userId,
    conversationId,
    payload: complete,
    createdAt: Date.now(),
  });
  let message: ChatMessage;
  try {
    message = await sendChatMessage(conversationId, complete);
  } catch (error) {
    if (isStaleChatKeyError(error)) {
      await removeChatOutboxEntry(clientMessageId).catch(() => {});
    }
    throw error;
  }
  await removeChatOutboxEntry(clientMessageId).catch(() => {});
  return message;
}

export async function replayChatOutbox(userId: string): Promise<ChatMessage[]> {
  await syncChatDeletions(userId);
  const entries = (await readChatOutbox()).filter((entry) => entry.userId === userId);
  const delivered: ChatMessage[] = [];
  for (const entry of entries) {
    try {
      const message = await sendChatMessage(entry.conversationId, entry.payload);
      delivered.push(message);
      try {
        await removeChatOutboxEntry(entry.clientMessageId);
      } catch {
        break;
      }
    } catch (error) {
      if (isStaleChatKeyError(error)) {
        // Undeliverable for good — drop it rather than block the queue.
        await removeChatOutboxEntry(entry.clientMessageId).catch(() => {});
        continue;
      }
      // Preserve this and later entries; stable ordering avoids reply inversion.
      break;
    }
  }
  return delivered;
}
