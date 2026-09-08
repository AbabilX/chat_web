import { api, type ChatE2EEIdentityEnvelope } from "@/lib/api";
import { openIdentityEnvelope, sealIdentityForDevice } from "./device-link";
import { loadTrustedIdentity } from "./device-vault";
import { adoptIdentity } from "./vault-adopt";

/**
 * New device: install the identity that arrived over a link handshake.
 *
 * The public key is taken from the server rather than the envelope so a
 * tampered envelope cannot quietly install a different identity — it simply
 * fails to match and every conversation key stays unreadable, which is the
 * loud failure we want.
 */
export async function adoptLinkedIdentity(
  envelope: ChatE2EEIdentityEnvelope,
  ephemeralPrivateKey: CryptoKey,
) {
  const status = await api.getChatE2EEVault();
  if (!status.exists) throw new Error("This account has no secure messages yet");
  const privateJwk = await openIdentityEnvelope(envelope, ephemeralPrivateKey);
  await adoptIdentity(privateJwk, status.vault.public_key);
  if (status.vault.wrapped_private_key) {
    await api.deleteChatE2EEWrappedKey().catch(() => {});
  }
  // An account with no recovery vault is one lost phone away from losing
  // everything. Nothing is done about it here: the link screen re-runs
  // ensureMessageIdentity next, which sees a held key with no recovery copy,
  // makes one, and shows the code. Doing it in both places would mint two.
}

/**
 * Approving device: seal this device's identity for a scanned device.
 * Reads the key back out of the trusted-device record rather than the unlocked
 * in-memory handle, which is deliberately non-extractable.
 */
export async function exportTrustedIdentity(scannedPublicJwk: JsonWebKey) {
  const status = await api.getChatE2EEVault();
  if (!status.exists) throw new Error("This device has no message identity to share");
  const privateJwk = await loadTrustedIdentity(status.vault.public_key);
  if (!privateJwk) throw new Error("This device has no message identity to share");
  return sealIdentityForDevice(privateJwk, scannedPublicJwk);
}
