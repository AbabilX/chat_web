"use client";

import { Tick02Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

/** One selectable destination (group or person) in the forward picker. */
export default function ForwardTargetRow({
  label,
  leading,
  selected,
  onToggle,
}: {
  label: string;
  leading: React.ReactNode;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors",
        selected
          ? "bg-[color-mix(in_srgb,var(--indigo)_10%,transparent)]"
          : "hover:bg-white/[0.06]",
      )}
    >
      <span className="shrink-0">{leading}</span>
      <span className="min-w-0 flex-1 truncate text-sm text-[var(--text)]">
        {label}
      </span>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-[var(--indigo)] bg-[var(--indigo)] text-white"
            : "border-[var(--border)]",
        )}
      >
        {selected ? <Tick02Icon size={12} /> : null}
      </span>
    </button>
  );
}
