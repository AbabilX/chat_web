import type { ChatOutboxEntry } from "./types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encryptChatOutboxEntry(
  key: CryptoKey,
  entry: ChatOutboxEntry,
) {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = encoder.encode(JSON.stringify(entry.payload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    plaintext,
  );
  return { ciphertext, nonce };
}

export async function decryptChatOutboxPayload(
  key: CryptoKey,
  ciphertext: ArrayBuffer,
  nonce: Uint8Array<ArrayBuffer>,
) {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    ciphertext,
  );
  return JSON.parse(decoder.decode(plaintext)) as ChatOutboxEntry["payload"];
}
