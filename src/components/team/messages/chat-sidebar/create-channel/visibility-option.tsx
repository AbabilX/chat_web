"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VisibilityOption({
  selected,
  onSelect,
  icon,
  title,
  hint,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: React.ReactNode;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-[var(--indigo)] bg-[color-mix(in_srgb,var(--indigo)_10%,transparent)]"
          : "border-[var(--border)] hover:bg-white/[0.04]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-[var(--indigo)] bg-[var(--indigo)] text-white" : "border-muted-foreground",
        )}
      >
        {selected ? <Check className="h-3 w-3" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm text-[var(--text)]">
          {icon}
          {title}
        </span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </span>
    </button>
  );
}
