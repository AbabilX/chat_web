"use client";

import { useMemo, useState } from "react";
import type { TeamMember } from "@/lib/api/types/team";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PresenceAvatar from "@/components/shared/presence-avatar";
import { chatInitials } from "../chat-utils";
import { t } from "@/lib/i18n";

export default function NewDmDialog({
  open,
  onOpenChange,
  members,
  currentUserId,
  onStartDM,
  language,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  currentUserId: string;
  onStartDM: (userId: string) => void;
  language?: string | null;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => m.user_id !== currentUserId)
      .filter((m) => !q || (m.name ?? "").toLowerCase().includes(q));
  }, [members, query, currentUserId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t(language, "chat.newMessage")}</DialogTitle>
        </DialogHeader>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(language, "chat.searchMembers")}
          className="mb-2"
          autoFocus
        />
        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {filtered.map((m) => (
            <button
              key={m.user_id}
              type="button"
              onClick={() => {
                onOpenChange(false);
                setQuery("");
                onStartDM(m.user_id);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[var(--surface2)]"
            >
              <PresenceAvatar userId={m.user_id} dotClassName="h-2 w-2">
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarImage src={m.avatar_url} alt="" />
                  <AvatarFallback className="rounded-md text-[10px]">
                    {chatInitials(m.name)}
                  </AvatarFallback>
                </Avatar>
              </PresenceAvatar>
              <span className="text-sm font-medium">{m.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
