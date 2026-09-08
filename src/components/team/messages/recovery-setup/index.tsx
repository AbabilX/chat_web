"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessageVaultStore } from "@/store/message-vault-store";
import RecoveryCodeCard from "./recovery-code-card";

/**
 * Shown once, when a recovery code is created.
 *
 * It stands in front of the chat deliberately. The code cannot be shown again —
 * neither AbabilX nor this browser keeps a copy — so a banner that could be
 * scrolled past would turn into a lost history on the next laptop. The
 * checkbox is friction on purpose.
 */
export default function RecoverySetupScreen() {
  const code = useMessageVaultStore((s) => s.recoveryCode);
  const confirm = useMessageVaultStore((s) => s.confirmRecoverySaved);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center bg-[var(--bg)] px-4 lg:h-dvh">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <KeyRound className="size-6" />
        </div>
        <h1 className="mt-4 text-center text-lg font-semibold text-[var(--text)]">
          Save your recovery code
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-[var(--text-muted)]">
          Your messages are end-to-end encrypted, so we cannot read them and
          cannot restore them for you. This code is how you read them on a new
          device.
        </p>

        <div className="mt-5">
          <RecoveryCodeCard code={code} />
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm leading-6 text-[var(--text)]">
          <input
            checked={saved}
            className="mt-1 size-4 accent-[var(--indigo)]"
            type="checkbox"
            onChange={(event) => setSaved(event.target.checked)}
          />
          I have saved this code somewhere safe.
        </label>

        <Button
          className="mt-4 h-11 w-full"
          disabled={!saved}
          type="button"
          onClick={confirm}
        >
          Continue to messages
        </Button>

        <p className="mt-3 text-center text-xs leading-5 text-[var(--text-muted)]">
          Lose it and your existing messages stay encrypted forever. You can
          replace it any time from Settings.
        </p>
      </div>
    </div>
  );
}
