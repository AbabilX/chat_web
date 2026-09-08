"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { useMessageVaultStore } from "@/store/message-vault-store";

export const RESET_CODE_LENGTH = 9;

export function normalizeResetCode(value: string) {
  return value
    .replace(/[^0-9a-fA-F]/g, "")
    .toUpperCase()
    .slice(0, RESET_CODE_LENGTH);
}

/**
 * Drives "start fresh": an emailed code, then a brand new message identity for
 * someone locked out of every device that held the old one.
 *
 * There is no new PIN to choose, because there is no longer anything on the
 * server for a PIN to protect. What the code authorises is only the identity
 * swap — it hands over no old message, since those are encrypted to a key that
 * no longer exists anywhere.
 *
 * The dialog is mounted only while open, so every field starts clean without an
 * effect resetting state.
 */
export function useVaultReset() {
  const startFresh = useMessageVaultStore((s) => s.startFresh);
  const [step, setStep] = useState<"request" | "verify">("request");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const requestCode = useCallback(async () => {
    setSending(true);
    setError("");
    try {
      const result = await api.requestChatE2EEResetCode();
      setSentTo(result.email);
      setStep("verify");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the reset code");
    } finally {
      setSending(false);
    }
  }, []);

  const submit = useCallback(async () => {
    setError("");
    if (code.length !== RESET_CODE_LENGTH) {
      setError(`Enter the ${RESET_CODE_LENGTH}-character code from your email.`);
      return false;
    }
    setSaving(true);
    try {
      await startFresh(code);
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not start a new message identity",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }, [code, startFresh]);

  return {
    step,
    sentTo,
    code,
    sending,
    saving,
    error,
    setCode,
    requestCode,
    submit,
  };
}
