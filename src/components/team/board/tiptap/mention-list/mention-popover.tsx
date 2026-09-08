"use client";

import { forwardRef, useRef } from "react";
import type { SuggestionKeyDownProps } from "@tiptap/suggestion";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import MentionList, { type MentionSuggestionItem } from ".";

type Measurable = { getBoundingClientRect: () => DOMRect };

/**
 * Wraps the mention suggestion list in a Radix (shadcn) Popover so positioning,
 * collision detection, and flipping are handled by the popover engine instead of
 * hand-rolled math. A virtual anchor follows the caret; `updatePositionStrategy`
 * keeps the panel glued to it while the user types.
 */
const MentionPopover = forwardRef<
  { onKeyDown: (props: SuggestionKeyDownProps) => boolean },
  {
    items: MentionSuggestionItem[];
    command: (item: MentionSuggestionItem) => void;
    clientRect?: (() => DOMRect | null) | null;
  }
>(function MentionPopover({ items, command, clientRect }, ref) {
  // Keep the latest caret-rect getter in a ref so the virtual anchor object stays
  // stable (Radix requires a stable ref) while always reading fresh coordinates.
  const rectFnRef = useRef(clientRect);
  rectFnRef.current = clientRect;

  const virtualRef = useRef<Measurable>({
    getBoundingClientRect: () =>
      rectFnRef.current?.() ?? new DOMRect(0, 0, 0, 0),
  });

  return (
    <Popover open modal={false}>
      <PopoverAnchor virtualRef={virtualRef} />
      <PopoverContent
        data-mention-popover=""
        side="bottom"
        align="start"
        sideOffset={6}
        collisionPadding={8}
        updatePositionStrategy="always"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="w-64 max-w-[calc(100vw-1.5rem)]"
        style={{
          padding: 0,
          border: "none",
          background: "transparent",
          boxShadow: "none",
        }}
      >
        <MentionList ref={ref} items={items} command={command} />
      </PopoverContent>
    </Popover>
  );
});

export default MentionPopover;
