"use client";

import { Button } from "@/components/ui/button";
import { useMessageVaultStore } from "@/store/message-vault-store";
import RecoverySetupScreen from "./recovery-setup";
import VaultUnlockScreen from "./vault-unlock";

/**
 * Stands in front of the chat until this browser holds the account's message
 * key. On a browser that has one — which is every browser after the first
 * visit — it never renders at all: the key is created or loaded without a
 * prompt. Anywhere else it asks for the code sitting in the owner's inbox.
 */
export default function MessageVaultGate() {
  const state = useMessageVaultStore((s) => s.state);
  const storeError = useMessageVaultStore((s) => s.error);
  const check = useMessageVaultStore((s) => s.check);

  if (state === "checking") {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center lg:h-dvh">
        <p className="text-sm text-[var(--text-muted)]">
          Preparing secure messages…
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center px-4 lg:h-dvh">
        <div className="text-center">
          <p className="text-sm text-red-600">
            {storeError || "Could not load secure messages"}
          </p>
          <Button className="mt-4" type="button" onClick={() => void check()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (state === "setup") return <RecoverySetupScreen />;
  return <VaultUnlockScreen />;
}
