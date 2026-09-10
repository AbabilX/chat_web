import type { ChatConversation, ChatMessage } from "@/lib/api";
import { decryptChatMessage, isMessageVaultUnlocked } from "./crypto";

// Chat-list previews of sealed conversations — DMs and personal groups alike.
// The sidebar used to open DMs only, and the server sent no ciphertext for a
// group, so every group's row read "Encrypted message" for good. Mobile keeps
// the same rule in `message_e2ee/sidebar_preview.dart`.
async function decryptPreview(
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
  // A row that will not open keeps the server's placeholder rather than
  // saying "Unable to decrypt" down the whole list.
  return decrypted.decryption_failed
    ? conversation
    : { ...conversation, last_message_body: decrypted.body };
}

export async function decryptSidebarPreviews(
  conversations: ChatConversation[],
  currentUserID: string,
) {
  if (!currentUserID || !isMessageVaultUnlocked()) return conversations;
  return Promise.all(
    conversations.map((conversation) =>
      decryptPreview(conversation, currentUserID),
    ),
  );
}
