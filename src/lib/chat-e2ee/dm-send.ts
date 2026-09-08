import type { ChatMessage } from "@/lib/api/types/chat";
import { isStaleChatKeyError, type ChatSendBody } from "@/lib/messages/outbox";
import { encryptNewDMText, rotateDMKey } from "./crypto";

/**
 * Encrypts a message and sends it, re-keying once if the server refuses the key.
 *
 * Used by DMs and personal groups alike — the roster is the server's business,
 * not this function's.
 *
 * The refusal means somebody in the conversation cannot read that key version.
 * Three ways that happens: they started a fresh identity, which drops their
 * envelope and leaves this device's own envelope intact so nothing local looks
 * wrong; they were added after the key was minted; or somebody was REMOVED and
 * the key was retired, which looks like nothing at all from here. Rotating
 * wraps a new key for everyone currently in the room, and the retry sends text
 * they can actually open — and that the departed member cannot.
 *
 * Exactly one retry: a second refusal is a real problem and belongs in front of
 * the user.
 */
export async function sendEncryptedChat(
  conversationId: string,
  text: string,
  currentUserID: string,
  send: (encrypted: ChatSendBody) => Promise<ChatMessage>,
): Promise<ChatMessage> {
  try {
    return await send(await encryptNewDMText(conversationId, text, currentUserID));
  } catch (error) {
    if (!isStaleChatKeyError(error)) throw error;
    await rotateDMKey(conversationId, currentUserID);
    return send(await encryptNewDMText(conversationId, text, currentUserID));
  }
}
