"use client";

import { MoreHorizontalIcon, Video01Icon, Mic01Icon, PencilEdit01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MorePopoverProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MorePopover({ isOpen, onToggle }: MorePopoverProps) {
  return (
    <div className="relative">
      <Tooltip content="More options" side="top">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded text-muted-foreground hover:bg-white/10 hover:text-[var(--text)]",
            isOpen && "bg-white/15 text-[var(--text)]"
          )}
          onClick={onToggle}
        >
          <MoreHorizontalIcon size={16} />
        </Button>
      </Tooltip>

      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 z-50 flex items-center gap-1 rounded border p-1 shadow-md bg-[var(--surface2)]"
          style={{ borderColor: "var(--border)" }}
        >
          <Tooltip content="Video record" side="top">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:bg-white/10 hover:text-[var(--text)]"
            >
              <Video01Icon size={14} />
            </Button>
          </Tooltip>
          <Tooltip content="Audio record" side="top">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:bg-white/10 hover:text-[var(--text)]"
            >
              <Mic01Icon size={14} />
            </Button>
          </Tooltip>
          <Tooltip content="Draw canvas" side="top">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:bg-white/10 hover:text-[var(--text)]"
            >
              <PencilEdit01Icon size={14} />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
