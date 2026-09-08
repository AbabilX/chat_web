"use client";

import { Button } from "@/components/ui/button";

export default function CallLeaveDialog({
  open,
  reloadAfter,
  onStay,
  onLeave,
}: {
  open: boolean;
  reloadAfter: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Stay in call"
        onClick={onStay}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="call-leave-title"
        className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-2xl"
      >
        <h2 id="call-leave-title" className="text-base font-semibold">
          {reloadAfter ? "Refresh will leave the call" : "Leave this call?"}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {reloadAfter
            ? "Refreshing or closing this page disconnects you. Stay to keep talking, or leave the call."
            : "You will disconnect from everyone in this call."}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" className="rounded-full" onClick={onStay}>
            Stay
          </Button>
          <Button
            type="button"
            className="rounded-full bg-rose-600 text-white hover:bg-rose-500"
            onClick={onLeave}
          >
            {reloadAfter ? "Leave & refresh" : "Leave"}
          </Button>
        </div>
      </div>
    </div>
  );
}
