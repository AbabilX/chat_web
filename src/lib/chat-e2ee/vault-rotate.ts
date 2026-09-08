import { api } from "@/lib/api";
import { loadTrustedIdentity } from "./device-vault";
import {
  formatRecoveryCode,
  generateRecoveryCode,
  wrapIdentityForRecovery,
} from "./recovery-key";

/**
 * Issues a new recovery code for the same identity.
 *
 * This is the only way to see a code again: the old one was never stored, here
 * or on the server, so it cannot be reprinted — it can only be replaced. Doing
 * so re-wraps the same private key, which means every message stays readable
 * and the previous code stops working the moment this returns.
 *
 * It reads the key out of the trusted-device record rather than the unlocked
 * in-memory handle, which is deliberately non-extractable.
 */
export async function regenerateRecoveryCode() {
  const status = await api.getChatE2EEVault();
  if (!status.exists) throw new Error("This account has no message identity yet");
  const privateJwk = await loadTrustedIdentity(status.vault.public_key);
  if (!privateJwk) {
    throw new Error("Unlock messages on this device before making a new code");
  }
  const code = generateRecoveryCode();
  const recovery = await wrapIdentityForRecovery(privateJwk, code);
  await api.putChatE2EERecoveryVault({
    public_key: status.vault.public_key,
    ...recovery,
  });
  return formatRecoveryCode(code);
}
