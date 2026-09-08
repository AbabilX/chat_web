"use client";

import { Headphones, Users } from "lucide-react";
import type { ChatMessage } from "@/lib/api";

function formatDuration(seconds = 0) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
    : `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function GroupCallEventRow({ message }: { message: ChatMessage }) {
  const count = message.meta?.participant_count ?? 0;
  return (
    <div className="mx-auto my-2 flex w-fit max-w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-2.5 text-sm shadow-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--indigo)_15%,transparent)] text-[var(--indigo)]">
        <Headphones className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <p className="font-medium">Group call ended</p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDuration(message.meta?.duration_seconds)}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {count}</span>
        </p>
      </div>
    </div>
  );
}
