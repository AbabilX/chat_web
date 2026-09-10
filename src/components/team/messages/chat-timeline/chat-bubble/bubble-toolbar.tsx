"use client";

import type { ReactNode } from "react";
import {
  Delete02Icon,
  MessageMultiple01Icon,
  PencilEdit01Icon,
  ArrowTurnBackwardIcon,
  Share08Icon,
} from "hugeicons-react";
import { AddReactionButton } from "@/components/shared/reaction-bar";
import { cn } from "@/lib/utils";

function IconAction({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full text-[var(--sig-label-2)] transition-colors",
        destructive
          ? "hover:bg-red-500/20 hover:text-red-400"
          : "hover:bg-[var(--sig-fill-strong)] hover:text-[var(--sig-label)]",
      )}
    >
      {children}
    </button>
  );
}

/** Signal keeps message actions off the bubble entirely — they fade in beside
 * it on hover, on the side away from the sender, so they never cover text. */
export default function BubbleToolbar({
  outgoing,
  reactionOpen,
  onReactionOpenChange,
  onToggleReaction,
  onReply,
  onOpenThread,
  onForward,
  onEdit,
  onDelete,
}: {
  outgoing: boolean;
  reactionOpen: boolean;
  onReactionOpenChange: (open: boolean) => void;
  onToggleReaction: (emoji: string) => void;
  /** Quoted reply — the answer stays in the main feed. */
  onReply?: () => void;
  onOpenThread?: () => void;
  onForward?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 self-center rounded-full px-1 py-0.5 transition-opacity duration-100",
        // Pinned open while the emoji picker is up, or it closes under itself.
        reactionOpen
          ? "opacity-100"
          : "pointer-events-none opacity-0 group-hover/bubble:pointer-events-auto group-hover/bubble:opacity-100 group-focus-within/bubble:pointer-events-auto group-focus-within/bubble:opacity-100",
        outgoing ? "order-first" : "order-last",
      )}
    >
      <AddReactionButton
        icon="smile"
        ariaLabel="React"
        open={reactionOpen}
        onOpenChange={onReactionOpenChange}
        onToggle={onToggleReaction}
        className="h-7 w-7 rounded-full p-0 text-[var(--sig-label-2)] hover:bg-[var(--sig-fill-strong)] hover:text-[var(--sig-label)]"
      />
      {onReply ? (
        <IconAction label="Reply" onClick={onReply}>
          <ArrowTurnBackwardIcon size={15} />
        </IconAction>
      ) : null}
      {onOpenThread ? (
        <IconAction label="Reply in thread" onClick={onOpenThread}>
          <MessageMultiple01Icon size={15} />
        </IconAction>
      ) : null}
      {onForward ? (
        <IconAction label="Forward" onClick={onForward}>
          <Share08Icon size={14} />
        </IconAction>
      ) : null}
      {onEdit ? (
        <IconAction label="Edit" onClick={onEdit}>
          <PencilEdit01Icon size={14} />
        </IconAction>
      ) : null}
      {onDelete ? (
        <IconAction label="Delete" destructive onClick={onDelete}>
          <Delete02Icon size={14} />
        </IconAction>
      ) : null}
    </div>
  );
}
