import { importPrivateIdentity } from "./primitives";
import { saveTrustedIdentity } from "./device-vault";
import { setIdentity } from "./identity-state";

/** Mints a fresh message identity. The private half never leaves this device. */
export async function generateIdentity() {
  const pair = (await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  )) as CryptoKeyPair;
  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.exportKey("jwk", pair.publicKey),
    crypto.subtle.exportKey("jwk", pair.privateKey),
  ]);
  return { publicKey, privateKey };
}

/** Puts an identity into memory and into this device's trusted record. */
export async function adoptIdentity(privateJwk: JsonWebKey, publicJwk: JsonWebKey) {
  setIdentity(await importPrivateIdentity(privateJwk), publicJwk);
  await saveTrustedIdentity(privateJwk, publicJwk).catch(() => {});
}
