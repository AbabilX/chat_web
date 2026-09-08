"use client";

import { FormEvent, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessageVaultStore } from "@/store/message-vault-store";
import VaultResetDialog from "../vault-reset";

/**
 * Unlocks this browser with the recovery code the owner saved.
 *
 * The code is turned into a key in this tab and never sent anywhere. What the
 * server stored is ciphertext it cannot open, so a correct code here restores
 * the same identity — and with it every message the account has ever received.
 */
export default function RecoveryCodeScreen({ onBack }: { onBack: () => void }) {
  const busy = useMessageVaultStore((s) => s.busy);
  const storeError = useMessageVaultStore((s) => s.error);
  const unlockWithCode = useMessageVaultStore((s) => s.unlockWithCode);
  const [code, setCode] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await unlockWithCode(code);
      setCode("");
    } catch {
      // The store surfaces a safe user-facing error below.
    }
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center bg-[var(--bg)] px-4 lg:h-dvh">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <KeyRound className="size-6" />
        </div>
        <h1 className="mt-4 text-center text-lg font-semibold text-[var(--text)]">
          Enter your recovery code
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-[var(--text-muted)]">
          The code you saved when you set up messages. Spacing and case do not
          matter.
        </p>

        <form className="mt-5 space-y-3" onSubmit={submit}>
          <textarea
            aria-label="Recovery code"
            autoFocus
            className="h-24 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-sm tracking-wider text-[var(--text)] outline-none focus:border-[var(--indigo)]"
            placeholder="A1B2-C3D4-…"
            spellCheck={false}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          {storeError ? (
            <p className="text-center text-sm text-red-600">{storeError}</p>
          ) : null}
          <Button className="h-11 w-full" disabled={busy} type="submit">
            {busy ? "Unlocking…" : "Unlock messages"}
          </Button>
        </form>

        <button
          className="mt-3 w-full text-center text-sm font-medium text-[var(--indigo)] hover:underline"
          type="button"
          onClick={onBack}
        >
          Scan from my phone instead
        </button>

        <div className="mt-5 border-t border-[var(--border)] pt-4">
          <p className="text-center text-xs text-[var(--text-muted)]">
            Lost the code and have no other device?
          </p>
          <Button
            className="mt-2 h-11 w-full"
            type="button"
            variant="outline"
            onClick={() => setResetOpen(true)}
          >
            Start fresh on this device
          </Button>
          <p className="mt-2 text-center text-xs leading-5 text-[var(--text-muted)]">
            Messaging works again after an emailed code. Messages you already
            have stay unreadable — nobody, including us, holds that key.
          </p>
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--text-muted)]">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Your code never leaves this device. AbabilX stores only a copy of your
          key that your code unlocks.
        </p>
      </div>
      {resetOpen ? <VaultResetDialog onOpenChange={setResetOpen} /> : null}
    </div>
  );
}
