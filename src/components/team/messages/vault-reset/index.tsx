"use client";

import { FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ResetWarning from "./reset-warning";
import { Input } from "@/components/ui/input";
import {
  RESET_CODE_LENGTH,
  normalizeResetCode,
  useVaultReset,
} from "./use-vault-reset";

export default function VaultResetDialog({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const reset = useVaultReset();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!(await reset.submit())) return;
    toast.success("New message identity created. New messages are secured with new keys.");
    onOpenChange(false);
  }

  return (
    <Dialog open onOpenChange={(next) => !reset.saving && onOpenChange(next)}>
      <DialogContent className="w-[min(92vw,420px)]">
        <DialogHeader>
          <DialogTitle>Start fresh on this device</DialogTitle>
          <DialogDescription>
            {reset.step === "request"
              ? "We will email a 9-character code to the address on your account."
              : `Enter the code sent to ${reset.sentTo} to create a new message identity.`}
          </DialogDescription>
        </DialogHeader>

        <ResetWarning />

        {reset.step === "request" ? (
          <div className="space-y-3">
            {reset.error ? <p className="text-sm text-red-600">{reset.error}</p> : null}
            <Button
              className="h-11 w-full"
              disabled={reset.sending}
              type="button"
              onClick={() => void reset.requestCode()}
            >
              {reset.sending ? "Sending…" : "Email me a reset code"}
            </Button>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              aria-label="Reset code"
              autoComplete="one-time-code"
              autoFocus
              className="h-12 text-center font-mono text-lg tracking-[0.35em] uppercase"
              maxLength={RESET_CODE_LENGTH}
              placeholder="9-character code"
              spellCheck={false}
              value={reset.code}
              onChange={(event) => reset.setCode(normalizeResetCode(event.target.value))}
            />
            {reset.error ? (
              <p className="text-center text-sm text-red-600">{reset.error}</p>
            ) : null}
            <Button className="h-11 w-full" disabled={reset.saving} type="submit">
              {reset.saving ? "Creating…" : "Create a new identity"}
            </Button>
            <Button
              className="w-full"
              disabled={reset.saving || reset.sending}
              type="button"
              variant="ghost"
              onClick={() => void reset.requestCode()}
            >
              {reset.sending ? "Sending…" : "Send a new code"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
