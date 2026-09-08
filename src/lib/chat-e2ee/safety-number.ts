import { base64UrlToBytes, e2eeEncoder } from "./primitives";

/**
 * Safety numbers — the only thing standing between AbabilX and every message.
 *
 * A DM key is wrapped against a public key the server hands us, and nothing in
 * the protocol proves that key is really the other person's. A malicious or
 * compromised server can hand us its own and read the conversation forever.
 * No amount of cryptography detects that from the inside; two people comparing
 * the same digits out of band is what detects it.
 *
 * The derivation is Signal's numeric fingerprint, kept exactly: 5200 rounds of
 * SHA-512 over the identity key, so that grinding a key whose fingerprint
 * collides costs 5200x what a single hash would, then six five-byte chunks
 * reduced mod 100000 to give 30 digits per person.
 *
 * The digits MUST come out identical on web, desktop and mobile, or two people
 * comparing them read unrelated numbers and the check is worse than useless —
 * it would teach them to expect a mismatch. `safety-number.test.mjs` and
 * `safety_number_test.dart` pin the same vector on both sides; change one and
 * the other fails.
 */

const FINGERPRINT_ITERATIONS = 5200;
const FINGERPRINT_VERSION = 0;
const CHUNK_OFFSETS = [0, 5, 10, 15, 20, 25];

export type SafetyIdentity = { userId: string; publicKey: JsonWebKey };

function concat(...parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/**
 * The identity key as an uncompressed P-256 point, `0x04 || X || Y`. A JWK is
 * not usable here directly: its property order and whitespace are free, and a
 * fingerprint has to be over bytes that cannot vary.
 */
function identityKeyBytes(publicKey: JsonWebKey) {
  const x = base64UrlToBytes(publicKey.x ?? "");
  const y = base64UrlToBytes(publicKey.y ?? "");
  if (x.length !== 32 || y.length !== 32) {
    throw new Error("This identity key cannot produce a safety number");
  }
  return concat(new Uint8Array([0x04]), x, y);
}

/**
 * 5200 SHA-512 rounds is deliberately expensive, and the same fingerprint gets
 * asked for from more than one place on screen. Keyed by the exact inputs, so a
 * substituted key is a cache miss and still gets noticed — this memoises work,
 * never a verdict.
 */
const fingerprintCache = new Map<string, Promise<string>>();

/** One person's 30 digits: their identity key bound to their user id. */
export function identityFingerprint(identity: SafetyIdentity) {
  const cacheKey = [
    identity.userId,
    identity.publicKey.crv ?? "",
    identity.publicKey.x ?? "",
    identity.publicKey.y ?? "",
  ].join(".");
  const cached = fingerprintCache.get(cacheKey);
  if (cached) return cached;
  const pending = computeFingerprint(identity).catch((error) => {
    // A rejected promise must not be cached, or one transient failure poisons
    // the pair for the rest of the session.
    fingerprintCache.delete(cacheKey);
    throw error;
  });
  fingerprintCache.set(cacheKey, pending);
  return pending;
}

async function computeFingerprint({ userId, publicKey }: SafetyIdentity) {
  const key = identityKeyBytes(publicKey);
  const version = new Uint8Array([FINGERPRINT_VERSION >> 8, FINGERPRINT_VERSION & 0xff]);
  let hash = concat(version, key, e2eeEncoder.encode(userId));
  for (let round = 0; round < FINGERPRINT_ITERATIONS; round += 1) {
    hash = new Uint8Array(
      await crypto.subtle.digest("SHA-512", concat(hash, key) as BufferSource),
    );
  }
  let digits = "";
  for (const offset of CHUNK_OFFSETS) {
    // Five big-endian bytes is at most 2^40, well inside an exact double, so
    // this arithmetic is not lossy the way a 32-bit shift would be.
    let chunk = 0;
    for (let i = offset; i < offset + 5; i += 1) chunk = chunk * 256 + hash[i];
    digits += String(chunk % 100000).padStart(5, "0");
  }
  return digits;
}

/**
 * The 60 digits both people see. Sorted, so it does not matter which side is
 * asking — two phones held next to each other must show the same string.
 */
export async function safetyNumber(mine: SafetyIdentity, theirs: SafetyIdentity) {
  const [ours, peer] = await Promise.all([
    identityFingerprint(mine),
    identityFingerprint(theirs),
  ]);
  return ours <= peer ? ours + peer : peer + ours;
}

/** Groups of five, the way they are meant to be read aloud. */
export function formatSafetyNumber(digits: string) {
  return digits.match(/.{1,5}/g)?.join(" ") ?? digits;
}
