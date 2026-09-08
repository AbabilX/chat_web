// Message text in and out of ciphertext. The key it uses is somebody else's
// job — conversation-key.ts owns fetching, minting and rotating it.
//
// "DM" in the names below is historical. Everything here is per-conversation:
// personal groups encrypt exactly the same way. Workspace channels are the only
// chat that is never encrypted, because server-side search cannot read
// ciphertext.
import { type ChatMessage } from "@/lib/api";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  e2eeDecoder as decoder,
  e2eeEncoder as encoder,
  randomBytes,
} from "./primitives";
import { ensureDMKey, loadDMKey, rotateDMKey } from "./conversation-key";

export { rotateDMKey };

export { isMessageVaultUnlocked, lockMessageVault } from "./identity-state";
export {
  ensureMessageIdentity,
  adoptLinkedIdentity,
  exportTrustedIdentity,
  unlockWithRecoveryCode,
  startFreshIdentity,
  takePendingRecoveryCode,
  type IdentityState,
} from "./vault";
export { regenerateRecoveryCode } from "./vault-rotate";

async function encryptWithDMKey(conversationID: string, text: string, senderID: string,
  entry: { version: number; key: CryptoKey }) {
  const nonce = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonce,
      additionalData: encoder.encode(
        `ababilx-dm-v1:${conversationID}:${entry.version}:${senderID}`,
      ),
    },
    entry.key,
    encoder.encode(text),
  );
  return {
    body: "",
    encrypted_body: bytesToBase64Url(new Uint8Array(ciphertext)),
    encryption_nonce: bytesToBase64Url(nonce),
    encryption_version: 1,
    encryption_key_version: entry.version,
  };
}

export async function encryptNewDMText(conversationID: string, text: string,
  currentUserID: string) {
  return encryptWithDMKey(
    conversationID,
    text,
    currentUserID,
    await ensureDMKey(conversationID, currentUserID),
  );
}

export async function encryptExistingDMText(conversationID: string, text: string,
  currentUserID: string) {
  const entry = await loadDMKey(conversationID, currentUserID);
  if (!entry) throw new Error("Secure message key is unavailable");
  return encryptWithDMKey(conversationID, text, currentUserID, entry);
}

export async function decryptChatMessage(message: ChatMessage, currentUserID: string) {
  if (message.encryption_version !== 1 || !message.encrypted_body) return message;
  try {
    let entry = await loadDMKey(message.conversation_id, currentUserID);
    // A newer key version means the other side rotated (usually after starting
    // a fresh identity), so the cached key is stale and worth one refetch.
    if (entry && (message.encryption_key_version ?? 0) > entry.version) {
      entry = await loadDMKey(message.conversation_id, currentUserID, true);
    }
    if (!entry || entry.version !== message.encryption_key_version) throw new Error("key unavailable");
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64UrlToBytes(message.encryption_nonce ?? ""),
        additionalData: encoder.encode(
          `ababilx-dm-v1:${message.conversation_id}:${entry.version}:${message.user_id}`,
        ),
      },
      entry.key,
      base64UrlToBytes(message.encrypted_body),
    );
    return { ...message, body: decoder.decode(plaintext), decryption_failed: false };
  } catch {
    return { ...message, body: "Unable to decrypt this message", decryption_failed: true };
  }
}

export function decryptChatMessages(messages: ChatMessage[], currentUserID: string) {
  return Promise.all(messages.map((message) => decryptChatMessage(message, currentUserID)));
}
