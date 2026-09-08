"use client";

import { ArrowDown01Icon } from "hugeicons-react";

export default function ChatDateDivider({ label }: { label: string }) {
  return (
    <div
      role="separator"
      aria-label={label}
      className="relative flex items-center py-3"
    >
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      <div
        className="mx-3 flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold text-[var(--text)]"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
      >
        <span>{label}</span>
        <ArrowDown01Icon size={12} className="text-muted-foreground" />
      </div>
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
    </div>
  );
}
