import type { ChatConversation, ChatMessage } from "@/lib/api";
import { decryptChatMessage, isMessageVaultUnlocked } from "./crypto";

async function decryptDMPreview(
  conversation: ChatConversation,
  currentUserID: string,
) {
  if (
    conversation.last_message_encryption_version !== 1 ||
    !conversation.last_message_encrypted_body
  ) {
    return conversation;
  }

  const previewMessage: ChatMessage = {
    id: "sidebar-preview",
    conversation_id: conversation.id,
    user_id: conversation.last_message_user_id ?? "",
    body: "",
    encrypted_body: conversation.last_message_encrypted_body,
    encryption_nonce: conversation.last_message_encryption_nonce,
    encryption_version: conversation.last_message_encryption_version,
    encryption_key_version: conversation.last_message_encryption_key_version,
    created_at: conversation.last_message_at ?? new Date(0).toISOString(),
    thread_count: 0,
  };
  const decrypted = await decryptChatMessage(previewMessage, currentUserID);
  return decrypted.decryption_failed
    ? conversation
    : { ...conversation, last_message_body: decrypted.body };
}

export async function decryptDMSidebarPreviews(
  conversations: ChatConversation[],
  currentUserID: string,
) {
  if (!currentUserID || !isMessageVaultUnlocked()) return conversations;
  return Promise.all(
    conversations.map((conversation) =>
      decryptDMPreview(conversation, currentUserID),
    ),
  );
}
