"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, ChevronDown } from "lucide-react";
import { formatSafetyNumber } from "@/lib/chat-e2ee/safety-number";
import { useSafetyNumber } from "./use-safety-number";
import SafetyNumberDigits from "./safety-number-digits";

/**
 * The out-of-band check for a DM.
 *
 * Collapsed by default: almost nobody needs it on any given day, but the people
 * who do need it need it to exist. It opens itself when the peer's key has
 * changed, because that is the one case the user did not go looking for.
 */
export default function SafetyNumberSection({
  peerUserId,
  peerName,
}: {
  peerUserId?: string;
  peerName: string;
}) {
  const [open, setOpen] = useState(false);
  const safety = useSafetyNumber(peerUserId, true);
  const changed = safety.trust === "changed";
  const expanded = open || changed;

  if (!peerUserId || safety.status === "unavailable") return null;

  return (
    <div
      className="rounded-lg border"
      style={{
        background: "var(--surface2)",
        borderColor: changed ? "var(--amber, #f59e0b)" : "transparent",
      }}>
      <button
        type="button"
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
        onClick={() => setOpen((prev) => !prev)}>
        <span className="shrink-0 text-[var(--text-muted)]">
          {changed ? (
            <ShieldAlert className="size-4 text-amber-500" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
            Safety number
          </p>
          <p className="truncate text-sm text-[var(--text)]">
            {changed
              ? `${peerName}'s security key changed`
              : safety.status === "ready"
                ? "Verify this conversation"
                : "Checking…"}
          </p>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-[var(--text-muted)] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && safety.status === "ready" ? (
        <div className="space-y-3 border-t border-[var(--border)] px-3 py-3">
          {changed ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              This can mean {peerName} reinstalled AbabilX or switched devices.
              It can also mean someone is intercepting this conversation. Compare
              the digits below with them over a call or in person before you
              trust it again.
            </p>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">
              Compare these digits with {peerName} over a call or in person. If
              they match, nobody is reading this conversation but the two of you.
            </p>
          )}
          <SafetyNumberDigits digits={formatSafetyNumber(safety.digits)} />
          {changed ? (
            <button
              type="button"
              className="w-full rounded-lg px-3 py-2 text-sm font-medium text-white"
              style={{ background: "var(--indigo)" }}
              onClick={safety.acknowledge}>
              I compared them — this is {peerName}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
