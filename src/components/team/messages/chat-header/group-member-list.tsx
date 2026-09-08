"use client";

import type { ChatMember } from "@/lib/api/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PresenceAvatar from "@/components/shared/presence-avatar";
import PeerCallOrStatus from "@/components/shared/peer-call-or-status";
import { chatInitials } from "../chat-utils";
import { t } from "@/lib/i18n";
import GroupMemberActions from "./group-member-actions";

export default function GroupMemberList({
  members,
  ownerId,
  currentUserId,
  language,
  conversationId,
  canManage = false,
  onChanged,
}: {
  members: ChatMember[];
  ownerId?: string;
  currentUserId: string;
  language?: string | null;
  /** Set on a personal group to enable the per-member admin menu. */
  conversationId?: string;
  canManage?: boolean;
  onChanged?: () => void;
}) {
  return (
    <div className="max-h-60 space-y-0.5 overflow-y-auto">
      {members.map((m) => (
        <div key={m.user_id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5">
          <PresenceAvatar userId={m.user_id} dotClassName="h-2 w-2">
            <Avatar className="h-8 w-8 rounded-md">
              <AvatarImage src={m.avatar_url} alt="" />
              <AvatarFallback className="rounded-md text-[10px]">
                {chatInitials(m.name)}
              </AvatarFallback>
            </Avatar>
          </PresenceAvatar>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="min-w-0 truncate text-sm text-[var(--text)]">
                {m.name}
                {m.user_id === currentUserId ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({t(language, "chat.you")})
                  </span>
                ) : null}
              </span>
              <PeerCallOrStatus userId={m.user_id} compact />
            </div>
          </div>
          {m.role === "admin" ? (
            <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--indigo)_15%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--indigo)]">
              Admin
            </span>
          ) : m.user_id === ownerId ? (
            <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--indigo)_15%,transparent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--indigo)]">
              {t(language, "chat.owner")}
            </span>
          ) : null}
          {canManage && conversationId && m.user_id !== currentUserId ? (
            <GroupMemberActions
              conversationId={conversationId}
              member={m}
              onChanged={() => onChanged?.()}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
