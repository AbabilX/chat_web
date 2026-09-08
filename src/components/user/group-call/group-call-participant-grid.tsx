"use client";

import { MicOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { GroupParticipantView } from "./group-call-context";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
}

function spaciousGridColumns(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count <= 4) return "grid-cols-1 sm:grid-cols-2";
  if (count <= 6) return "grid-cols-2 lg:grid-cols-3";
  if (count <= 12) return "grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
  return "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
}

export default function GroupCallParticipantGrid({
  participants,
  compact = false,
}: {
  participants: GroupParticipantView[];
  compact?: boolean;
}) {
  return (
    <div className={cn(
      "gap-3",
      compact
        ? "flex h-full w-full overflow-x-auto lg:grid lg:w-60 lg:auto-rows-[132px] lg:grid-cols-1 lg:overflow-x-hidden lg:overflow-y-auto"
        : "grid h-full min-h-0 w-full flex-1 auto-rows-[minmax(150px,1fr)] overflow-y-auto",
      !compact && spaciousGridColumns(participants.length),
    )}>
      {participants.map((participant) => (
        <article
          key={participant.identity}
          className={cn(
            "relative flex min-h-[132px] items-center justify-center overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_top,_var(--indigo-glow),_transparent_52%)] bg-[var(--surface2)] transition-colors",
            compact && "min-w-48 lg:min-w-0",
            participant.isSpeaking ? "border-[var(--green)] ring-2 ring-[var(--green)]/35" : "border-[var(--border)]",
          )}
        >
          <Avatar className="h-16 w-16 shadow-2xl sm:h-20 sm:w-20">
            <AvatarImage src={participant.avatarUrl} alt={participant.name} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-700 text-lg font-semibold text-white sm:text-xl">
              {initials(participant.name)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/90 px-2 py-1 text-xs text-[var(--text)] backdrop-blur-sm">
            <span className="truncate">{participant.name}{participant.isLocal ? " (You)" : ""}</span>
            {participant.isMuted ? <MicOff className="h-3.5 w-3.5 shrink-0 text-rose-500" /> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
