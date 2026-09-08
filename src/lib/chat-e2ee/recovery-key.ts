import {
  base64UrlToBytes,
  bytesToBase64Url,
  e2eeDecoder as decoder,
  e2eeEncoder as encoder,
  randomBytes,
} from "./primitives";

/**
 * The recovery code: 256 bits of randomness, generated here, shown once, and
 * never sent to AbabilX.
 *
 * It is what makes end-to-end encryption survive a new laptop. The account's
 * private message key is stored on the server wrapped by a key derived from
 * this code, so the stored blob is ciphertext against a 2^256 keyspace — the
 * server can hold it forever and never open it.
 *
 * The entropy is the entire point. A six-digit PIN over the same blob was 10^6,
 * about a hundred GPU-seconds, which is why that scheme was retired. Never
 * shorten this, never let a user choose it, and never let it reach the server.
 */

const RECOVERY_INFO = encoder.encode("ababilx-recovery-key-v1");
const RECOVERY_AAD = encoder.encode("ababilx-recovery-vault-v1");
const RECOVERY_VERSION = 1;
const CODE_BYTES = 32;
const GROUP = 4;

export type RecoveryVault = {
  wrapped_key: { ciphertext: string; nonce: string };
  salt: string;
  version: number;
};

/** Formats the raw code the way it is shown and typed: hex in groups of four. */
export function formatRecoveryCode(bytes: Uint8Array) {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return (hex.match(new RegExp(`.{1,${GROUP}}`, "g")) ?? []).join("-");
}

/**
 * Reads a code back, ignoring how it was spaced or cased. People retype these
 * from paper and from password managers; rejecting a lowercase paste would be a
 * lockout caused by formatting.
 */
export function parseRecoveryCode(input: string) {
  const hex = input.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
  if (hex.length !== CODE_BYTES * 2) return null;
  const bytes = new Uint8Array(CODE_BYTES);
  for (let i = 0; i < CODE_BYTES; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function generateRecoveryCode() {
  return randomBytes(CODE_BYTES);
}

/**
 * Derives the wrapping key. HKDF, not PBKDF2: the input already has 256 bits of
 * entropy, so there is nothing for iterations to buy — stretching only protects
 * a guessable secret, and this one is not guessable.
 */
async function recoveryWrappingKey(code: Uint8Array, salt: Uint8Array) {
  const material = await crypto.subtle.importKey(
    "raw",
    code as BufferSource,
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: salt as BufferSource, info: RECOVERY_INFO },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Seals a private identity under a recovery code, ready to store. */
export async function wrapIdentityForRecovery(
  privateJwk: JsonWebKey,
  code: Uint8Array,
): Promise<RecoveryVault> {
  const salt = randomBytes(32);
  const nonce = randomBytes(12);
  const key = await recoveryWrappingKey(code, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, additionalData: RECOVERY_AAD },
    key,
    encoder.encode(JSON.stringify(privateJwk)),
  );
  return {
    wrapped_key: {
      ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
      nonce: bytesToBase64Url(nonce),
    },
    salt: bytesToBase64Url(salt),
    version: RECOVERY_VERSION,
  };
}

/**
 * Opens a stored vault with the code its owner typed.
 *
 * A wrong code fails the AES-GCM tag, which is indistinguishable from a
 * corrupted blob and is reported as simply "wrong code" — there is nothing else
 * it could usefully mean to the person holding it.
 */
export async function unwrapIdentityWithRecovery(
  vault: RecoveryVault,
  code: Uint8Array,
): Promise<JsonWebKey> {
  const key = await recoveryWrappingKey(code, base64UrlToBytes(vault.salt));
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64UrlToBytes(vault.wrapped_key.nonce),
      additionalData: RECOVERY_AAD,
    },
    key,
    base64UrlToBytes(vault.wrapped_key.ciphertext),
  );
  return JSON.parse(decoder.decode(plaintext)) as JsonWebKey;
}
