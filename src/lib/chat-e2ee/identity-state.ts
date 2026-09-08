import { clearTrustedIdentity } from "./device-vault";
import { forgetPeerFingerprints } from "./safety-number-store";

// The unlocked identity lives in memory only: a reload or a lock wipes it, and it
// is never written anywhere except the encrypted trusted-device record.
let identityPrivateKey: CryptoKey | null = null;
let identityPublicKey: JsonWebKey | null = null;

/**
 * Conversation AES keys, cached per conversation with the key version they
 * belong to. `stale` marks a version the server reported as unreadable by some
 * member — sending under it would produce a message they could never open — so
 * the next send rotates instead of reusing it.
 */
export const dmKeys = new Map<
  string,
  { version: number; key: CryptoKey; stale: boolean }
>();

export function getIdentityPrivateKey() {
  return identityPrivateKey;
}

export function getIdentityPublicKey() {
  return identityPublicKey;
}

export function setIdentity(privateKey: CryptoKey, publicKey: JsonWebKey) {
  identityPrivateKey = privateKey;
  identityPublicKey = publicKey;
  dmKeys.clear();
}

export function isMessageVaultUnlocked() {
  return identityPrivateKey !== null;
}

export function lockMessageVault() {
  identityPrivateKey = null;
  identityPublicKey = null;
  dmKeys.clear();
}

if (typeof window !== "undefined") {
  window.addEventListener("ababilx:logout", () => {
    lockMessageVault();
    void clearTrustedIdentity();
    // Remembered peer fingerprints belong to the account that signed out. Left
    // behind, the next account on this browser would be told a key "changed"
    // when it had simply never seen it.
    forgetPeerFingerprints();
  });
}
