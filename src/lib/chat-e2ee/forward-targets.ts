import { api } from "@/lib/api";
import type { ChatConversation } from "@/lib/api/types/chat";
import { encryptNewDMText } from "./crypto";
import { isEncryptedConversation } from "./eligible";

/** One destination, as much of it as choosing a payload needs. */
export type ForwardConversation = Pick<ChatConversation, "id" | "type" | "scope">;

/** Text prepared for one destination: plaintext for a channel, ciphertext otherwise. */
export type ForwardPayload = {
  body?: string;
  encrypted_body?: string;
  encryption_nonce?: string;
  encryption_key_version?: number;
};

export type ForwardTarget = {
  conversation_id: string;
  message: ForwardPayload;
  caption?: ForwardPayload;
};

type BuildForwardTargetsInput = {
  /** Plaintext of the thing being forwarded — already decrypted if it came from a DM. */
  text: string;
  caption?: string;
  /**
   * Conversations picked from the sidebar. Not ids: a personal group is
   * encrypted and a workspace channel is not, and only the conversation itself
   * says which — forwarding plaintext into an encrypted group is a 409, and
   * ciphertext into a channel is a 400.
   */
  conversations: ForwardConversation[];
  /** Team members to reach by DM; the DM is created here if it does not exist. */
  userIds: string[];
  currentUserId: string;
};

/**
 * Builds the per-destination payloads a forward needs.
 *
 * The server cannot do this itself: it never holds the plaintext of an encrypted
 * message, and every conversation has its own key, so each destination needs its
 * own ciphertext. Workspace channels stay plaintext — the server copies its own
 * stored body there, so the text below only matters when the source or the
 * destination is encrypted.
 */
export async function buildForwardTargets({
  text,
  caption,
  conversations,
  userIds,
  currentUserId,
}: BuildForwardTargetsInput): Promise<ForwardTarget[]> {
  const trimmedCaption = caption?.trim() ?? "";

  const conversationTargets = await Promise.all(
    conversations.map(async (conversation) => {
      if (!isEncryptedConversation(conversation)) {
        return {
          conversation_id: conversation.id,
          message: { body: text },
          caption: trimmedCaption ? { body: trimmedCaption } : undefined,
        } satisfies ForwardTarget;
      }
      return buildEncryptedTarget(conversation.id, text, trimmedCaption, currentUserId);
    }),
  );

  const dmTargets = await Promise.all(
    userIds.map(async (userId) =>
      // The conversation has to exist before anything can be encrypted for it —
      // the key envelopes are stored per conversation.
      buildEncryptedTarget(
        (await api.startChatDM(userId)).id,
        text,
        trimmedCaption,
        currentUserId,
      ),
    ),
  );

  return [...conversationTargets, ...dmTargets];
}

async function buildEncryptedTarget(
  conversationId: string,
  text: string,
  caption: string,
  currentUserId: string,
): Promise<ForwardTarget> {
  const encrypt = (value: string) =>
    encryptNewDMText(conversationId, value, currentUserId);

  return {
    conversation_id: conversationId,
    // An attachment-only forward has nothing to encrypt, and the server accepts
    // an empty payload when attachments travel with it.
    message: text.trim() ? await encrypt(text) : {},
    caption: caption ? await encrypt(caption) : undefined,
  };
}
