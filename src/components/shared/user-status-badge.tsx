"use client";

import { cn } from "@/lib/utils";
import type { UserStatus } from "@/store/user-status-store";

/** Slack-style custom status chip — emoji + truncated text. */
export default function UserStatusBadge({
  status,
  compact = false,
  className,
  maxWidthClassName,
}: {
  status: UserStatus;
  compact?: boolean;
  className?: string;
  /** e.g. "max-w-[72px]" beside a tight avatar pill */
  maxWidthClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1 rounded-md bg-[var(--surface2)] font-semibold text-[var(--text-muted)]",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        maxWidthClassName,
        className,
      )}
      title={status.text}
    >
      {status.emoji ? (
        <span className="shrink-0 leading-none">{status.emoji}</span>
      ) : null}
      <span className="truncate">{status.text}</span>
    </span>
  );
}
