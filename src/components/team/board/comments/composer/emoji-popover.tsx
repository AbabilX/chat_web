"use client";

import { SmileIcon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";

interface EmojiPopoverProps {
  editor: Editor | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  showLabel?: boolean;
}

export function EmojiPopover({
  editor,
  isOpen,
  onToggle,
  onClose,
  showLabel = false,
}: EmojiPopoverProps) {
  const EMOJIS = ["👍", "❤️", "🎉", "💡", "🚀", "😄", "👀", "✅"];

  return (
    <div className="relative">
      <Tooltip content="Emoji" side="top">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            showLabel
              ? "h-7 gap-1.5 rounded px-2 text-xs text-muted-foreground hover:bg-white/10 hover:text-(--text)"
              : "h-7 w-7 rounded p-0 text-muted-foreground hover:bg-white/10 hover:text-(--text)",
            isOpen && "bg-white/15 text-(--text)",
          )}
          aria-label="Emoji"
          onClick={onToggle}>
          <SmileIcon size={16} />
          {showLabel ? (
            <span className="@max-[420px]:sr-only">Emoji</span>
          ) : null}
        </Button>
      </Tooltip>

      {isOpen && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 flex items-center gap-1 rounded border bg-(--surface2) p-1 shadow-md"
          style={{ borderColor: "var(--border)" }}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="p-1 hover:bg-white/10 rounded text-sm transition-colors cursor-pointer"
              onClick={() => {
                editor?.chain().focus().insertContent(emoji).run();
                onClose();
              }}>
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
