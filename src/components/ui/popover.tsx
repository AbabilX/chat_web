"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { DismissableLayerBranch } from "@radix-ui/react-dismissable-layer";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    /** Use inside modal dialogs so clicks reach the popover in production. */
    nested?: boolean;
  }
>(({ className, align = "center", sideOffset = 6, nested = false, style, ...props }, ref) => {
  const content = (
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-xl border p-3 shadow-xl outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        nested && "z-[9999]",
        className,
      )}
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--surface2)",
        color: "var(--text)",
        ...(nested ? { pointerEvents: "auto", zIndex: 9999 } : null),
        ...style,
      }}
      {...props}
    />
  );

  return (
    <PopoverPrimitive.Portal>
      {nested ? <DismissableLayerBranch>{content}</DismissableLayerBranch> : content}
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
