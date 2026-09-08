"use client";

import { ArrowRight01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

export const COMMENT_QUICK_REPLIES = [
  { emoji: "🎉", label: "Looks good!", text: "Looks good!" },
  { emoji: "👋", label: "Need help?", text: "Need help?" },
  { emoji: "⛔", label: "This is blocked...", text: "This is blocked..." },
  { emoji: "🔍", label: "Can you clarify...?", text: "Can you clarify...?" },
  { emoji: "✅", label: "This is on track", text: "This is on track" },
] as const;

export default function CommentQuickReplies({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative min-w-0 max-w-full">
      <div
        className={cn(
          "flex min-w-0 max-w-full flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 pr-5",
          "scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        {COMMENT_QUICK_REPLIES.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onPick(item.text)}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs transition-colors hover:border-[var(--kanban-input-border)] hover:bg-white/[0.04]"
            style={{
              borderColor: "var(--kanban-chip-border)",
              background: "var(--kanban-chip-bg)",
              color: "var(--text)",
            }}
          >
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 flex w-8 items-center justify-end bg-gradient-to-l from-[var(--surface)] to-transparent"
        aria-hidden
      >
        <ArrowRight01Icon
          size={16}
          className="text-muted-foreground/70"
        />
      </div>
    </div>
  );
}
