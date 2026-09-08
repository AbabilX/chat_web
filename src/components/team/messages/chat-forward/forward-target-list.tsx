"use client";

import { useMemo, useState } from "react";
import { Search01Icon } from "hugeicons-react";
import type { ChatConversation } from "@/lib/api";
import type { TeamMember } from "@/lib/api/types/team";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import GroupAvatarStack from "../chat-sidebar/group-avatar-stack";
import { chatConvLabel, chatInitials } from "../chat-utils";
import { t } from "@/lib/i18n";
import ForwardTargetRow from "./forward-target-row";

export default function ForwardTargetList({
  channels,
  members,
  selectedConvIds,
  selectedUserIds,
  onToggleConv,
  onToggleUser,
  language,
}: {
  channels: ChatConversation[];
  members: TeamMember[];
  selectedConvIds: Set<string>;
  selectedUserIds: Set<string>;
  onToggleConv: (id: string) => void;
  onToggleUser: (id: string) => void;
  language?: string | null;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      channels.filter((c) =>
        chatConvLabel(c).toLowerCase().includes(q),
      ),
    [channels, q],
  );
  const people = useMemo(
    () => members.filter((m) => (m.name ?? "").toLowerCase().includes(q)),
    [members, q],
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search01Icon
          size={16}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(language, "chat.searchChats")}
          className="pl-8"
        />
      </div>

      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {groups.length > 0 ? (
          <div className="space-y-0.5">
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t(language, "chat.channels")}
            </p>
            {groups.map((c) => (
              <ForwardTargetRow
                key={c.id}
                label={chatConvLabel(c)}
                selected={selectedConvIds.has(c.id)}
                onToggle={() => onToggleConv(c.id)}
                leading={
                  <span className="flex h-8 w-8 items-center justify-center">
                    <GroupAvatarStack
                      avatars={c.member_avatars}
                      avatarUrl={c.avatar_url}
                      name={chatConvLabel(c)}
                    />
                  </span>
                }
              />
            ))}
          </div>
        ) : null}

        {people.length > 0 ? (
          <div className="space-y-0.5">
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t(language, "chat.people")}
            </p>
            {people.map((m) => (
              <ForwardTargetRow
                key={m.user_id}
                label={m.name ?? "Unknown"}
                selected={selectedUserIds.has(m.user_id)}
                onToggle={() => onToggleUser(m.user_id)}
                leading={
                  <Avatar className="h-8 w-8 rounded-md">
                    <AvatarImage src={m.avatar_url} alt="" />
                    <AvatarFallback className="rounded-md text-[10px]">
                      {chatInitials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                }
              />
            ))}
          </div>
        ) : null}

        {groups.length === 0 && people.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t(language, "chat.noConversations")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
