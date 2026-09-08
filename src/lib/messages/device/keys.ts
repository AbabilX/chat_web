import type { LocalMessagingDevice } from "./types";

export async function generateLocalMessagingDevice(
  userId: string,
  deviceId = crypto.randomUUID(),
): Promise<LocalMessagingDevice> {
  const generated = (await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  )) as CryptoKeyPair;
  const publicKey = await crypto.subtle.exportKey("jwk", generated.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", generated.privateKey);
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    privateJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveBits"],
  );
  const now = Date.now();
  return {
    id: userId,
    deviceId,
    privateKey,
    publicKey,
    keyVersion: 0,
    createdAt: now,
    rotatedAt: now,
  };
}

export function samePublicKey(left: JsonWebKey, right: JsonWebKey) {
  return (
    left.kty === right.kty &&
    left.crv === right.crv &&
    left.x === right.x &&
    left.y === right.y
  );
}
