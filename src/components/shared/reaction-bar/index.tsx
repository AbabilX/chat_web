"use client";

import { useState, type CSSProperties } from "react";
import { PlusSignIcon, SmileIcon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ReactionGroup = {
  emoji: string;
  count: number;
  users: { user_id: string; user_name?: string }[];
  reacted_by_me: boolean;
};

export const REACTION_PICKER_EMOJIS = [
  "👍",
  "❤️",
  "🎉",
  "👀",
  "🚀",
  "✅",
  "👎",
  "🔥",
];

export type ReactionBarTheme = {
  chipBorder?: string;
  chipBg?: string;
  chipHoverBorder?: string;
  popoverBorder?: string;
  popoverBg?: string;
  activeChipClass?: string;
  inactiveChipClass?: string;
};

const kanbanTheme: ReactionBarTheme = {
  chipBorder: "var(--kanban-chip-border)",
  chipBg: "var(--kanban-chip-bg)",
  chipHoverBorder: "var(--kanban-input-border)",
  popoverBorder: "var(--kanban-input-border)",
  popoverBg: "var(--kanban-input-bg)",
  activeChipClass:
    "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold shadow-[0_0_10px_rgba(99,102,241,0.15)] scale-[1.03]",
  inactiveChipClass:
    "border-[var(--border)] bg-[var(--surface)]/50 text-muted-foreground hover:text-[var(--text)] hover:border-indigo-500/40 hover:bg-indigo-500/5",
};

export function ReactionChips({
  reactions,
  onToggle,
  disabled,
  className,
  theme = kanbanTheme,
}: {
  reactions: ReactionGroup[];
  onToggle: (emoji: string) => void;
  disabled?: boolean;
  className?: string;
  theme?: ReactionBarTheme;
}) {
  if (reactions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          disabled={disabled}
          title={r.users.map((u) => u.user_name || "User").join(", ")}
          onClick={() => onToggle(r.emoji)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
            r.reacted_by_me
              ? theme.activeChipClass
              : (theme.inactiveChipClass ??
                  cn(
                    "text-(--text)",
                    theme.chipBorder && "border-(--chip-border)",
                  )),
            disabled && "pointer-events-none opacity-60",
          )}
          style={
            !r.reacted_by_me && theme.chipBorder
              ? ({
                  borderColor: theme.chipBorder,
                  background: theme.chipBg,
                } as CSSProperties)
              : undefined
          }>
          <span>{r.emoji}</span>
          <span className="ml-0.5 text-inherit tabular-nums font-semibold opacity-90">
            {r.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export function AddReactionButton({
  onToggle,
  disabled,
  open,
  onOpenChange,
  icon = "plus",
  label,
  className,
  style,
  theme = kanbanTheme,
  ariaLabel = "Add reaction",
}: {
  onToggle: (emoji: string) => void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: "plus" | "smile";
  label?: string;
  className?: string;
  style?: CSSProperties;
  theme?: ReactionBarTheme;
  ariaLabel?: string;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  function pick(emoji: string) {
    setOpen(false);
    onToggle(emoji);
  }

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            label
              ? "h-7 gap-1.5 rounded-md px-2 text-xs text-muted-foreground hover:bg-white/10 hover:text-(--text)"
              : "h-7 w-7 rounded-md p-0 text-muted-foreground hover:bg-white/10 hover:text-(--text)",
            className,
          )}
          style={style}
          aria-label={ariaLabel}>
          {icon === "smile" ? (
            <SmileIcon size={16} />
          ) : (
            <PlusSignIcon size={14} />
          )}
          {label ? <span>{label}</span> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto border p-2"
        style={{
          borderColor: theme.popoverBorder,
          background: theme.popoverBg,
        }}>
        <div className="flex flex-wrap gap-1">
          {REACTION_PICKER_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded-md px-2 py-1 text-lg hover:bg-white/10"
              onClick={() => pick(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function ReactionBar({
  reactions,
  onToggle,
  disabled,
  className,
  showAddButton = true,
  addButtonIcon = "plus",
  theme = kanbanTheme,
  addButtonAriaLabel,
}: {
  reactions: ReactionGroup[];
  onToggle: (emoji: string) => void;
  disabled?: boolean;
  className?: string;
  showAddButton?: boolean;
  addButtonIcon?: "plus" | "smile";
  theme?: ReactionBarTheme;
  addButtonAriaLabel?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <ReactionChips
        reactions={reactions}
        onToggle={onToggle}
        disabled={disabled}
        theme={theme}
      />
      {showAddButton ? (
        <AddReactionButton
          onToggle={onToggle}
          disabled={disabled}
          icon={addButtonIcon}
          theme={theme}
          ariaLabel={addButtonAriaLabel}
          className="rounded-full border"
          style={{
            borderColor: theme.chipBorder,
            background: theme.chipBg,
          }}
        />
      ) : null}
    </div>
  );
}
