"use client";

import { UserAdd01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

/**
 * The visible way into the People dialog. The bottom bar only has room for an
 * icon, so this carries the label wherever a user would actually look for it:
 * an empty conversation list, or the end of the workspace-member list.
 */
export default function AddPeopleCta({
  onClick,
  label = "Add people",
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--indigo)] hover:bg-[color-mix(in_srgb,var(--indigo)_10%,transparent)] hover:text-[var(--text)]",
        className,
      )}
    >
      <UserAdd01Icon size={14} className="shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
