"use client";

import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TeamMember } from "@/lib/api/types/team";

function memberLabel(m: TeamMember) {
  return m.name || m.github_username || m.email || "Member";
}

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function BoardMemberPicker({
  members,
  selectedIds,
  onChange,
  lockedIds = [],
}: {
  members: TeamMember[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  lockedIds?: string[];
}) {
  const active = members.filter((m) => m.status === "active");
  const locked = new Set(lockedIds);

  function toggle(userId: string) {
    if (locked.has(userId)) return;
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  }

  if (active.length === 0) {
    return <p className="text-xs text-muted-foreground">No active team members.</p>;
  }

  return (
    <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-md border p-1" style={{ borderColor: "var(--border)" }}>
      {active.map((m) => {
        const selected = selectedIds.includes(m.user_id);
        const isLocked = locked.has(m.user_id);
        return (
          <button
            key={m.user_id}
            type="button"
            disabled={isLocked}
            onClick={() => toggle(m.user_id)}
            className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={m.avatar_url} alt={memberLabel(m)} />
                <AvatarFallback className="text-[9px]">{initials(m.name || m.github_username)}</AvatarFallback>
              </Avatar>
              <span className="truncate">{memberLabel(m)}</span>
              {isLocked ? (
                <span className="text-[10px] text-muted-foreground">(required)</span>
              ) : null}
            </span>
            {selected ? <Check className="h-4 w-4 shrink-0 text-indigo-400" /> : null}
          </button>
        );
      })}
    </div>
  );
}
