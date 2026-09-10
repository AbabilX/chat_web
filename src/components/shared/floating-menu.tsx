"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type FloatingMenuItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
};

/** Signal's menu: min-w-[200px], max-w-[300px], 6px of padding around 6px rows. */
const MENU_WIDTH = 216;
const EDGE_PAD = 8;

/**
 * Signal Desktop's right-click menu: a small floating list anchored at the
 * cursor, dismissed by Escape, an outside click, scroll or resize.
 *
 * It started as the message bubble's menu and is now every right-click menu in
 * the app — a bubble, a photo, a file, a link preview — so the same list looks
 * and dismisses the same way wherever it is raised.
 */
export default function FloatingMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number;
  y: number;
  items: FloatingMenuItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: y, left: x });

  // Flip the menu back inside the window once its real height is known.
  useLayoutEffect(() => {
    const height = ref.current?.offsetHeight ?? 0;
    const maxLeft = window.innerWidth - MENU_WIDTH - EDGE_PAD;
    const maxTop = window.innerHeight - height - EDGE_PAD;
    setPos({
      left: Math.max(EDGE_PAD, Math.min(x, maxLeft)),
      top: Math.max(EDGE_PAD, Math.min(y, maxTop)),
    });
  }, [x, y, items.length]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointerDown, true);
    window.addEventListener("resize", onClose);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("blur", onClose);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointerDown, true);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  if (items.length === 0) return null;

  return createPortal(
    <div
      ref={ref}
      role="menu"
      className="fixed z-[10001] overflow-hidden rounded-[14px] border p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: pos.top,
        left: pos.left,
        width: MENU_WIDTH,
        background: "color-mix(in srgb, var(--surface) 94%, transparent)",
        borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
      }}
      onContextMenu={(e) => e.preventDefault()}
      // A portal still bubbles through the REACT tree, so without this a click
      // on a row reaches whatever raised the menu — the tile that would open
      // the viewer, the backdrop that would close it.
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            item.onSelect();
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-[10px] p-1.5 text-left text-[14px] leading-tight transition-colors",
            // Signal styles Delete like every other row — colour here would be
            // the only accent in the menu and reads as a warning, not an action.
            "text-[var(--sig-label)] hover:bg-[var(--sig-fill-strong)]",
          )}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            {item.icon}
          </span>
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
}
