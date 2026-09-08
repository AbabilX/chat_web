"use client";

import { Call02Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

/** Slack-style "In a call" chip. */
export default function InCallLabel({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full bg-amber-500/15 font-semibold text-amber-300",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        className,
      )}
    >
      <Call02Icon size={compact ? 10 : 12} className="shrink-0" />
      <span className="truncate">In a call</span>
    </span>
  );
}
