"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Signal's message-request prompt. It takes the composer's place at the foot
 * of a thread a stranger opened, so the messages above stay readable while the
 * answer is still owed.
 *
 * Only one of the three answers is permanent. Block is the durable refusal;
 * Delete just clears the thread, and a later message from the same person
 * opens a fresh request. Accept settles it — as does simply replying, which
 * the server does on its own.
 */
export default function MessageRequestBar({
  peerName,
  onAccept,
  onDelete,
  onBlock,
}: {
  peerName: string;
  onAccept: () => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  onBlock: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void> | void) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="shrink-0 border-t px-4 py-3"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
        Let <span className="font-medium">{peerName}</span> message you? They
        won&apos;t know you&apos;ve seen this until you accept.
      </p>
      <div className="mt-2.5 flex items-center justify-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          className="text-red-600 hover:text-red-600 dark:text-red-400"
          onClick={() => void run(onBlock)}
        >
          Block
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => void run(onDelete)}
        >
          Delete
        </Button>
        <Button type="button" size="sm" disabled={busy} onClick={() => void run(onAccept)}>
          Accept
        </Button>
      </div>
    </div>
  );
}
