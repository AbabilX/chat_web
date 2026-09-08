import type { ChatConversation } from "@/lib/api/types/chat";

/**
 * Whether this conversation's text is end-to-end encrypted.
 *
 * The mirror of `e2eeEligible` on the server, and it must stay one: a client
 * that encrypts where the server does not expect it gets a 400, and one that
 * sends plaintext where the server does expect it gets a 409.
 *
 * DMs in either scope, and personal groups. Workspace channels never — they are
 * a searchable shared record and server-side search cannot read ciphertext.
 */
export function isEncryptedConversation(
  conversation?: Pick<ChatConversation, "type" | "scope"> | null,
): boolean {
  if (!conversation) return false;
  if (conversation.type === "dm") return true;
  return conversation.scope === "personal" && conversation.type === "group";
}
