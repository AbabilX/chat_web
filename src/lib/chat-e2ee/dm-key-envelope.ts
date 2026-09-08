import type { ChatE2EEKeyEnvelope } from "@/lib/api";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  e2eeEncoder as encoder,
  envelopeKey,
  randomBytes,
} from "./primitives";
import { getIdentityPrivateKey } from "./identity-state";

/**
 * Seals a conversation key to one member's public identity.
 *
 * The recipient id is bound into the AAD, so an envelope cannot be re-pointed
 * at a different member by moving the row.
 */
export async function wrapDMKey(
  key: CryptoKey,
  recipientID: string,
  publicJwk: JsonWebKey,
): Promise<ChatE2EEKeyEnvelope> {
  const ephemeral = (await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  )) as CryptoKeyPair;
  const nonce = randomBytes(12);
  const wrappingKey = await envelopeKey(ephemeral.privateKey, publicJwk);
  const rawKey = await crypto.subtle.exportKey("raw", key);
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonce,
      additionalData: encoder.encode(`ababilx-dm-key-v1:${recipientID}`),
    },
    wrappingKey,
    rawKey,
  );
  return {
    ephemeral_public_key: await crypto.subtle.exportKey("jwk", ephemeral.publicKey),
    nonce: bytesToBase64Url(nonce),
    ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
  } satisfies ChatE2EEKeyEnvelope;
}

/** Opens an envelope sealed to this device's identity. */
export async function unwrapDMKey(envelope: ChatE2EEKeyEnvelope, userID: string) {
  const privateKey = getIdentityPrivateKey();
  if (!privateKey) throw new Error("Secure messages are not ready on this device yet");
  const wrappingKey = await envelopeKey(privateKey, envelope.ephemeral_public_key);
  const rawKey = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64UrlToBytes(envelope.nonce),
      additionalData: encoder.encode(`ababilx-dm-key-v1:${userID}`),
    },
    wrappingKey,
    base64UrlToBytes(envelope.ciphertext),
  );
  return crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, ["encrypt", "decrypt"]);
}
