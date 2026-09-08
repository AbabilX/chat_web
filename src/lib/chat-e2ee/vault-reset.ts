import { api } from "@/lib/api";
import {
  formatRecoveryCode,
  generateRecoveryCode,
  wrapIdentityForRecovery,
} from "./recovery-key";
import { setPendingRecoveryCode } from "./recovery-pending";
import { adoptIdentity, generateIdentity } from "./vault-adopt";

/**
 * Replaces the account's message identity, for someone with no device that
 * holds the old one and no recovery code either.
 *
 * This is destructive and cannot be undone: messages encrypted to the old
 * identity stay encrypted to a key nobody has, including us. It exists because
 * the alternative is a locked door — an account that can never send a secure
 * message again is worse than one that lost its old ones. History returns only
 * where another member of a conversation still holds the key and re-wraps it,
 * which the clients do on their next load.
 *
 * The emailed code gates it because replacing an identity is exactly what
 * somebody who had stolen an account would want to do.
 *
 * The new identity carries a new recovery code from the first moment, sent in
 * the same request: leaving it stranded on one browser would recreate the
 * situation this reset was needed to escape.
 */
export async function startFreshIdentity(code: string) {
  const { publicKey, privateKey } = await generateIdentity();
  const recoveryCode = generateRecoveryCode();
  const recovery = await wrapIdentityForRecovery(privateKey, recoveryCode);
  await api.resetChatE2EEVault({ code, public_key: publicKey, recovery });
  await adoptIdentity(privateKey, publicKey);
  setPendingRecoveryCode(formatRecoveryCode(recoveryCode));
}
