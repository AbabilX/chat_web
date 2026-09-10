"use client";

import { useMessageVaultStore } from "@/store/message-vault-store";
import RecoverySetupScreen from "./recovery-setup";
import VaultUnlockScreen from "./vault-unlock";

/**
 * Stands in front of the chat until this browser holds the account's message
 * key. On a browser that has one it never renders: the key loads without a
 * prompt. Anywhere else it offers a phone QR (or the recovery code). A failed
 * vault probe still lands here — a dead-end "api error" page used to hide the
 * only ways to get the key onto this machine.
 */
export default function MessageVaultGate() {
  const state = useMessageVaultStore((s) => s.state);

  if (state === "checking") {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center lg:h-dvh">
        <p className="text-sm text-[var(--text-muted)]">
          Preparing secure messages…
        </p>
      </div>
    );
  }

  if (state === "setup") return <RecoverySetupScreen />;
  return <VaultUnlockScreen />;
}
