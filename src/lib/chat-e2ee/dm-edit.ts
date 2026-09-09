import type { ChatMessage } from "@/lib/api/types/chat";
import { isStaleChatKeyError } from "@/lib/messages/outbox";
import { encryptExistingDMText, rotateDMKey } from "./crypto";

/**
 * Re-encrypts an existing message under the conversation's current key and
 * saves it, re-keying once if the server refuses that key.
 *
 * The edit path needs this for the same reason `sendEncryptedChat` does: a
 * member who was removed (key retired) or who started a fresh identity leaves
 * this device holding a perfectly good envelope, so nothing looks wrong here
 * until the server answers `chat_key_rotation_required`. Rotating wraps a new
 * key for everyone currently in the room and the retry seals the edit to it.
 *
 * Exactly one retry, as on send: a second refusal belongs in front of the user.
 */
export async function editEncryptedChat(
  conversationId: string,
  text: string,
  currentUserID: string,
  save: (encrypted: Awaited<ReturnType<typeof encryptExistingDMText>>) => Promise<ChatMessage>,
): Promise<ChatMessage> {
  try {
    return await save(await encryptExistingDMText(conversationId, text, currentUserID));
  } catch (error) {
    if (!isStaleChatKeyError(error)) throw error;
    await rotateDMKey(conversationId, currentUserID);
    return save(await encryptExistingDMText(conversationId, text, currentUserID));
  }
}
