import { api } from "@/lib/api";
import { loadTrustedIdentity } from "./device-vault";
import {
  formatRecoveryCode,
  generateRecoveryCode,
  wrapIdentityForRecovery,
} from "./recovery-key";
import { adoptIdentity, generateIdentity } from "./vault-adopt";

export { adoptLinkedIdentity, exportTrustedIdentity } from "./vault-link";
export { unlockWithRecoveryCode } from "./vault-recover";
export { startFreshIdentity } from "./vault-reset";
export { takePendingRecoveryCode } from "./recovery-pending";
import { setPendingRecoveryCode } from "./recovery-pending";

/**
 * What this browser can do about secure messages right now.
 *
 * "ready" — the identity is in memory; nothing to ask.
 * "setup" — a recovery code was just generated and has to be shown once. The
 *           chat is already usable; this screen exists so the code is seen
 *           before it is needed, which is the only moment it can be.
 * "unlock" — the account has an identity this browser does not hold. It comes
 *            from a phone over QR, or from the recovery code.
 *
 * AbabilX never holds the private key or the code. That is the trade for
 * end-to-end encryption, and it is why "unlock" cannot be skipped for the user.
 */
export type IdentityState = "ready" | "setup" | "unlock";

/**
 * Mints an identity plus a recovery code, publishes the wrapped key, and stages
 * the code for the setup screen to show.
 */
async function provisionIdentity(privateJwk: JsonWebKey, publicJwk: JsonWebKey) {
  const code = generateRecoveryCode();
  const recovery = await wrapIdentityForRecovery(privateJwk, code);
  await api.putChatE2EERecoveryVault({ public_key: publicJwk, ...recovery });
  await adoptIdentity(privateJwk, publicJwk);
  setPendingRecoveryCode(formatRecoveryCode(code));
  return "setup" as const;
}

/**
 * Brings secure messages up.
 *
 * A first visit mints the identity here, wraps it under a fresh recovery code,
 * and shows that code once. A browser that already holds the key loads it and
 * asks nothing. A browser that does not has to be given the key — by a phone or
 * by the code — because there is nowhere else it could come from.
 */
export async function ensureMessageIdentity(): Promise<IdentityState> {
  const status = await api.getChatE2EEVault();

  if (!status.exists) {
    const { publicKey, privateKey } = await generateIdentity();
    try {
      return await provisionIdentity(privateKey, publicKey);
    } catch {
      // Two devices setting up at once both see an empty account and both mint;
      // the server keeps whichever landed first. Re-read and take the normal
      // path rather than reporting an error for a race that resolved itself.
      const settled = await api.getChatE2EEVault();
      if (!settled.exists) throw new Error("Could not set up secure messages");
      return "unlock";
    }
  }

  const held = await loadTrustedIdentity(status.vault.public_key).catch(() => null);
  if (held) {
    await adoptIdentity(held, status.vault.public_key);
    // An identity from before recovery codes has no way onto a second machine.
    // This browser holds it, so wrap it under a new code and show that code —
    // the one moment this can be fixed without asking the user for anything.
    if (!status.vault.recovery) {
      return provisionIdentity(held, status.vault.public_key).catch(() => "ready" as const);
    }
    return "ready";
  }

  return "unlock";
}
