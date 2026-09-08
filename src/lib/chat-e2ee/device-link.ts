import type { ChatE2EEIdentityEnvelope } from "@/lib/api";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  e2eeDecoder as decoder,
  e2eeEncoder as encoder,
  envelopeKey,
  importPrivateIdentity,
  randomBytes,
} from "./primitives";

const LINK_AAD = encoder.encode("ababilx-message-device-link-v1");

/**
 * Moving a message identity onto a new device.
 *
 * The new device mints an ephemeral key pair and puts the public half in the QR
 * it draws. A device that already holds the identity reads that key off the
 * camera — never from the server — and seals the identity against it. The
 * server therefore relays ciphertext for a key it has never seen and cannot
 * derive, which is what lets the whole scheme work with no PIN and no
 * server-side copy of anybody's private key.
 */
export type LinkOffer = {
  /** Kept in memory on the new device only; opens the envelope when it lands. */
  privateKey: CryptoKey;
  /** Goes into the QR image as &k=… */
  publicKeyParam: string;
  /** Shown on both screens so a swapped QR is visible before approving. */
  verificationCode: string;
};

/** Six digits over the ephemeral key, so both ends can compare by eye. */
export async function linkVerificationCode(publicJwk: JsonWebKey) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`${publicJwk.crv}.${publicJwk.x}.${publicJwk.y}`),
  );
  const bytes = new Uint8Array(digest);
  const value =
    ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]) % 1_000_000;
  return value.toString().padStart(6, "0");
}

function encodeJwk(jwk: JsonWebKey) {
  return bytesToBase64Url(encoder.encode(JSON.stringify(jwk)));
}

export function decodeJwk(param: string): JsonWebKey {
  return JSON.parse(decoder.decode(base64UrlToBytes(param))) as JsonWebKey;
}

/** New device: create the ephemeral pair this link will be sealed against. */
export async function createLinkOffer(): Promise<LinkOffer> {
  const pair = (await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  )) as CryptoKeyPair;
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  return {
    privateKey: pair.privateKey,
    publicKeyParam: encodeJwk(publicJwk),
    verificationCode: await linkVerificationCode(publicJwk),
  };
}

/**
 * Approving device: seal this device's identity for the scanned device alone.
 * A fresh ephemeral pair is used for the wrapping so the long-term identity key
 * is never used directly as an agreement key.
 */
export async function sealIdentityForDevice(
  identityPrivateJwk: JsonWebKey,
  scannedPublicJwk: JsonWebKey,
): Promise<ChatE2EEIdentityEnvelope> {
  const ephemeral = (await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  )) as CryptoKeyPair;
  const nonce = randomBytes(12);
  const wrappingKey = await envelopeKey(ephemeral.privateKey, scannedPublicJwk);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, additionalData: LINK_AAD },
    wrappingKey,
    encoder.encode(JSON.stringify(identityPrivateJwk)),
  );
  return {
    ephemeral_public_key: await crypto.subtle.exportKey("jwk", ephemeral.publicKey),
    nonce: bytesToBase64Url(nonce),
    ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
  };
}

/** New device: open the envelope with the ephemeral key it kept in memory. */
export async function openIdentityEnvelope(
  envelope: ChatE2EEIdentityEnvelope,
  ephemeralPrivateKey: CryptoKey,
) {
  const wrappingKey = await envelopeKey(
    ephemeralPrivateKey,
    envelope.ephemeral_public_key,
  );
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64UrlToBytes(envelope.nonce),
      additionalData: LINK_AAD,
    },
    wrappingKey,
    base64UrlToBytes(envelope.ciphertext),
  );
  const jwk = JSON.parse(decoder.decode(plaintext)) as JsonWebKey;
  // Importing proves the bytes really are a usable P-256 private key rather
  // than whatever else survived decryption.
  await importPrivateIdentity(jwk);
  return jwk;
}
