"use client";

import { useState } from "react";
import { MoreVerticalIcon } from "hugeicons-react";
import { api } from "@/lib/api";
import type { ChatMember } from "@/lib/api/types/chat";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Promote, demote, remove — the per-member menu on a personal group's roster.
 *
 * "Remove" is deliberately absent while the member is an admin: demote them
 * first. That extra step is the only thing standing between a group and one
 * admin quietly clearing out the others, and the server enforces it too.
 */
export default function GroupMemberActions({
  conversationId,
  member,
  onChanged,
}: {
  conversationId: string;
  member: ChatMember;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isAdmin = member.role === "admin";

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    try {
      await action();
      onChanged();
      setOpen(false);
    } catch {
      // The roster reloads from the server either way, so a failure just
      // leaves the list as it was.
    } finally {
      setBusy(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`Manage ${member.name}`}
        disabled={busy}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-white/[0.06] hover:text-[var(--text)]"
      >
        <MoreVerticalIcon size={15} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        <MenuItem
          label={isAdmin ? "Remove as admin" : "Make admin"}
          disabled={busy}
          onClick={() =>
            void run(() =>
              api.setChatGroupMemberRole(
                conversationId,
                member.user_id,
                isAdmin ? "member" : "admin",
              ),
            )
          }
        />
        {!isAdmin ? (
          <MenuItem
            label="Remove from group"
            danger
            disabled={busy}
            onClick={() =>
              void run(() =>
                api.removeChatGroupMember(conversationId, member.user_id),
              )
            }
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function MenuItem({
  label,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm transition-colors disabled:opacity-50",
        danger
          ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
          : "text-[var(--text)] hover:bg-white/[0.06]",
      )}
    >
      {label}
    </button>
  );
}
