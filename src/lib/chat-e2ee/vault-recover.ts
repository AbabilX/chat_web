import { api } from "@/lib/api";
import { parseRecoveryCode, unwrapIdentityWithRecovery } from "./recovery-key";
import { adoptIdentity } from "./vault-adopt";

/**
 * Unlocks this browser with the recovery code its owner saved.
 *
 * The code is turned into a key here and used here; it is never sent anywhere.
 * What the server handed over was ciphertext it cannot open, so a correct code
 * is the only thing in the world that opens it — and every message the account
 * has ever received decrypts, because the identity is the same one.
 */
export async function unlockWithRecoveryCode(input: string) {
  const code = parseRecoveryCode(input);
  if (!code) throw new Error("That is not a complete recovery code");

  const status = await api.getChatE2EEVault();
  if (!status.exists || !status.vault.recovery) {
    throw new Error("This account has no recovery code set up");
  }
  let privateJwk: JsonWebKey;
  try {
    privateJwk = await unwrapIdentityWithRecovery(status.vault.recovery, code);
  } catch {
    // A wrong code and a corrupted blob fail the same AES-GCM tag check, and
    // the difference is of no use to the person holding the code.
    throw new Error("That recovery code is not right");
  }
  await adoptIdentity(privateJwk, status.vault.public_key);
}
